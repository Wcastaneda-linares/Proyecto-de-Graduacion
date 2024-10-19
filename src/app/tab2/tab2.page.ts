interface Usuario {
  name: string;
  email: string;
  birthDate?: string;
}

import { FormularioAdopcionComponent } from '../formulario-adopcion/formulario-adopcion.component';
import { firstValueFrom } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ModalController, ActionSheetController, ToastController } from '@ionic/angular';
import { FireserviceService } from '../fireservice.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ImageViewerModalPage } from '../image-viewer-modal/image-viewer-modal.page';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { AlertController } from '@ionic/angular'; 

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
})
export class Tab2Page implements OnInit {
  publicaciones: any[] = [];
  user: any;

  constructor(
    private firestore: AngularFirestore,
    private fireService: FireserviceService,
    private modalController: ModalController,
    private actionSheetController: ActionSheetController,
    private toastController: ToastController,
    private afAuth: AngularFireAuth,
    private alertController: AlertController // Agrega esta línea
  ) {}

  ngOnInit() {
    this.obtenerPublicaciones();
    this.afAuth.authState.subscribe(user => {
      this.user = user;
      const uid = localStorage.getItem('uid');
      if (!uid) {
        console.warn('ID de usuario no proporcionado.');
      } else {
        console.log('ID Usuario Creador:', uid);
      }
    });
  }

  

  async obtenerNombreUsuario(idUsuario: string): Promise<string> {
    if (!idUsuario) {
      console.warn('ID de usuario no proporcionado.');
      return 'Usuario desconocido';
    }

    try {
      console.log('Obteniendo usuario con ID:', idUsuario);
      const docSnapshot = await firstValueFrom(
        this.firestore.collection('users').doc(idUsuario).get()
      );

      if (docSnapshot?.exists) {
        const data = docSnapshot.data() as Usuario;
        console.log('Datos del usuario:', data);
        return data?.name || 'Usuario sin nombre';
      } else {
        console.warn(`Usuario con ID ${idUsuario} no encontrado.`);
        return 'Usuario desconocido';
      }
    } catch (error) {
      console.error('Error al obtener el nombre del usuario:', error);
      return 'Error al obtener nombre';
    }
  }

  obtenerPublicaciones() {
    this.firestore
      .collection('publicaciones')
      .valueChanges({ idField: 'id' })
      .subscribe(async (publicaciones: any[]) => {
        console.log('Publicaciones obtenidas:', publicaciones);
  
        const publicacionesConUsuarios = await Promise.all(
          publicaciones.map(async (publicacion: any) => {
            console.log('ID Usuario Creador:', publicacion.idUsuarioCreador);
  
            const nombreUsuario = await this.obtenerNombreUsuario(publicacion.idUsuarioCreador);
  
            // Inicializar valores para el centro
            let nombreCentro = 'Nombre del centro no disponible';
            let direccionCentro = 'Dirección no disponible';
            let telefonoCentro = 'Teléfono no disponible';
  
            // Si hay un `centroId`, buscar la información del centro
            if (publicacion.centroId) {
              console.log('Buscando información para centroId:', publicacion.centroId);
              try {
                const centroDocRef = this.firestore.collection('centros_adopcion').doc(publicacion.centroId);
                const centroSnapshot = await centroDocRef.get().toPromise();
  
                if (centroSnapshot && centroSnapshot.exists) {
                  const datosCentro = centroSnapshot.data() as {
                    nombre: string;
                    direccion: string;
                    telefono: string;
                  };
                  console.log('Datos del centro obtenidos:', datosCentro);
  
                  // Verificar y asignar datos del centro
                  nombreCentro = datosCentro?.nombre || 'Nombre del centro no disponible';
                  direccionCentro = datosCentro?.direccion || 'Dirección no disponible';
                  telefonoCentro = datosCentro?.telefono || 'Teléfono no disponible';
                } else {
                  console.warn(`Centro con ID ${publicacion.centroId} no encontrado.`);
                }
              } catch (error) {
                console.error('Error al obtener datos del centro:', error);
              }
            }
  
            return {
              ...publicacion,
              nombreUsuario,
              nombreDonante: publicacion.donante?.nombre || 'Donante desconocido',
              nombreMascota: publicacion.mascota?.nombre || 'Nombre desconocido',
              telefonoDonante: publicacion.donante?.numeroContacto || 'Teléfono no proporcionado',
              razaMascota: publicacion.mascota?.raza || 'Desconocida',
              edadMascota: publicacion.mascota?.edad || 'No disponible',
              tipoMascota: publicacion.mascota?.tipo || 'No especificado',
              estadoSaludMascota: publicacion.mascota?.estadoSalud || 'No disponible',
              descripcionMascota: publicacion.mascota?.descripcion || 'Sin descripción',
              sexoMascota: publicacion.mascota?.sexo || 'No especificado',
              personalidadMascota: publicacion.mascota?.personalidad?.join(', ') || 'Sin especificar',
              likes: publicacion.likes || [],
              // Agregar los datos del centro si están disponibles
              nombreCentro,
              direccionCentro,
              telefonoCentro,
            };
          })
        );
  
        this.publicaciones = publicacionesConUsuarios;
        console.log('Publicaciones con usuarios:', this.publicaciones);
      });
  }
  
  
  
  ionViewWillEnter() {
    console.log('Tab2 se ha vuelto activa');
    this.cargarDatos();
  }

  cargarDatos() {
    console.log('Datos recargados en Tab2');
    // Aquí va la lógica para refrescar los datos en esta tab.
  }

  async mostrarToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  

  
  async mostrarInformacion(publicacion: any) {
    const userHasLiked = publicacion.likes.includes(this.user?.uid);
    const actionSheet = await this.actionSheetController.create({
      header: 'Detalles de la publicación',
      buttons: [
        {
          text: 'Ver imagen',
          icon: 'image',
          handler: () => this.mostrarImagen(publicacion.imagenURL),
        },
        {
          text: 'Compartir',
          icon: 'share',
          handler: () => this.compartirPublicacion(publicacion),
        },
        {
          text: userHasLiked ? 'Quitar "Me gusta"' : 'Dar "Me gusta"',
          icon: userHasLiked ? 'heart-dislike' : 'heart',
          handler: () => this.toggleMeGusta(publicacion),
        },
        {
          text: 'Solicitar adopción',
          icon: 'paw',
          handler: () => this.solicitarAdopcion(publicacion),
        },
        {
          text: 'Aceptar en Centro',
          icon: 'home',
          handler: () => this.aceptarAnimalEnCentro(publicacion.id),
        },
        {
          text: 'Cambiar Disponibilidad',
          icon: 'options',
          handler: () => this.cambiarDisponibilidad(publicacion),
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
        },
      ],
    });
  
    await actionSheet.present();
  }
  
  async aceptarAnimalEnCentro(idMascota: string) {
    const centroId = localStorage.getItem('centroId'); // Supongamos que el ID del centro se guarda en el localStorage tras el login del centro
  
    if (!centroId) {
      console.error('ID del centro no encontrado.');
      return;
    }
  
    try {
      // Actualizar el centro para agregar el ID de la mascota aceptada
      await this.firestore.collection('centros_adopcion').doc(centroId).update({
        animalesAceptados: firebase.firestore.FieldValue.arrayUnion(idMascota),
      });
  
      // Actualizar la mascota para asignarle el centro
      await this.firestore.collection('publicaciones').doc(idMascota).update({
        centroIdAdoptante: centroId,
        estado: 'En refugio',
      });
  
      console.log('Animal aceptado por el centro correctamente.');
      this.mostrarToast('Animal aceptado en el centro.');
    } catch (error) {
      console.error('Error al aceptar el animal en el centro:', error);
      this.mostrarToast('Error al aceptar el animal en el centro.');
    }
  }

  async cambiarDisponibilidad(publicacion: any) {
  const alert = await this.alertController.create({
    header: 'Cambiar Disponibilidad',
    inputs: [
      {
        name: 'disponibilidad',
        type: 'radio',
        label: 'Disponible',
        value: 'Disponible',
        checked: publicacion.estado === 'Disponible',
      },
      {
        name: 'disponibilidad',
        type: 'radio',
        label: 'Adoptado',
        value: 'Adoptado',
        checked: publicacion.estado === 'Adoptado',
      },
      {
        name: 'disponibilidad',
        type: 'radio',
        label: 'En refugio',
        value: 'En refugio',
        checked: publicacion.estado === 'En refugio',
      },
    ],
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
      },
      {
        text: 'Guardar',
        handler: async (data) => {
          try {
            await this.firestore.collection('publicaciones').doc(publicacion.id).update({
              estado: data,
            });
            this.mostrarToast('Disponibilidad actualizada.');
          } catch (error) {
            console.error('Error al actualizar la disponibilidad:', error);
            this.mostrarToast('Error al actualizar la disponibilidad.');
          }
        },
      },
    ],
  });

  await alert.present();
}

  /*
  async cambiarDisponibilidad(publicacion: any) {
    const alert = await this.alertController.create({
      header: 'Cambiar Disponibilidad',
      inputs: [
        {
          name: 'disponibilidad',
          type: 'radio',
          label: 'Disponible',
          value: 'Disponible',
          checked: publicacion.estado === 'Disponible',
        },
        {
          name: 'disponibilidad',
          type: 'radio',
          label: 'Adoptado',
          value: 'Adoptado',
          checked: publicacion.estado === 'Adoptado',
        },
        {
          name: 'disponibilidad',
          type: 'radio',
          label: 'En refugio',
          value: 'En refugio',
          checked: publicacion.estado === 'En refugio',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            try {
              await this.firestore.collection('publicaciones').doc(publicacion.id).update({
                estado: data,
              });
              this.mostrarToast('Disponibilidad actualizada.');
            } catch (error) {
              console.error('Error al actualizar la disponibilidad:', error);
              this.mostrarToast('Error al actualizar la disponibilidad.');
            }
          },
        },
      ],
    });
  
    await alert.present();
  }
  */
  
  async mostrarImagen(imagenURL: string) {
    const modal = await this.modalController.create({
      component: ImageViewerModalPage,
      componentProps: { imagenURL }
    });
    await modal.present();
  }

  toggleMeGusta(publicacion: { id: string; likes: string[] }) {
    const userId = this.user.uid;
    const likes = publicacion.likes || [];

    if (likes.includes(userId)) {
      const newLikes = likes.filter(id => id !== userId);
      this.firestore.collection('publicaciones').doc(publicacion.id).update({ likes: newLikes })
        .then(() => this.mostrarToast('Has quitado "Me gusta" a la publicación'))
        .catch(error => console.error('Error al quitar "Me gusta":', error));
    } else {
      likes.push(userId);
      this.firestore.collection('publicaciones').doc(publicacion.id).update({ likes })
        .then(() => this.mostrarToast('Has dado "Me gusta" a la publicación'))
        .catch(error => console.error('Error al dar "Me gusta":', error));
    }
  }



  compartirPublicacion(publicacion: any) {
    const shareData = {
      title: 'Publicación de Mascota',
      text: `¡Mira a ${publicacion.nombreMascota}! ${publicacion.descripcionMascota}`,
      url: publicacion.imagenURL
    };

    if (navigator.share) {
      navigator.share(shareData).then(() => console.log('Compartido con éxito'))
        .catch(error => console.error('Error al compartir:', error));
    } else {
      console.error('El navegador no soporta compartir');
    }
  }

  async solicitarAdopcion(publicacion: any) {
    if (!this.user) {
      this.mostrarToast('Debe iniciar sesión para solicitar adopción');
      return;
    }
  
    const modal = await this.modalController.create({
      component: FormularioAdopcionComponent,
    });
  
    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned.data) {
        this.firestore.collection('solicitudes_adopcion').add({
          idMascota: publicacion.id || 'ID desconocido',
          nombreMascota: publicacion.nombreMascota || 'Nombre desconocido',
          idUsuarioSolicitante: this.user.uid,
          nombreUsuarioSolicitante: this.user.email,
          nombreCompleto: dataReturned.data.nombreCompleto,
          telefono: dataReturned.data.telefono,
          tieneFamilia: dataReturned.data.tieneFamilia,  
          tieneHijos: dataReturned.data.tieneHijos,  
          direccion: dataReturned.data.direccion,
          motivoAdopcion: dataReturned.data.motivoAdopcion,
          identificacionURL: dataReturned.data.identificacionURL,  // Asegurarse de incluir la URL del archivo
          fecha: new Date(),
          estado: 'Pendiente',
        }).then(() => this.mostrarToast('Solicitud de adopción enviada con éxito'))
          .catch(error => console.error('Error al enviar solicitud de adopción:', error));
      }
    });
  
    return await modal.present();
  }
  


  logout() {
    this.fireService.logout().then(() => console.log('Sesión cerrada'))
      .catch(error => console.error('Error al cerrar sesión', error));
  }
}
