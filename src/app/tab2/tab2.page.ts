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
    private afAuth: AngularFireAuth
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
  
            return {
              ...publicacion,
              nombreUsuario,
              nombreDonante: publicacion.donante?.nombre || 'Donante desconocido', // Acceso correcto al nombre del donante
              nombreMascota: publicacion.mascota?.nombre || 'Nombre desconocido',
              razaMascota: publicacion.mascota?.raza || 'Desconocida',
              edadMascota: publicacion.mascota?.edad || 'No disponible',
              tipoMascota: publicacion.mascota?.tipo || 'No especificado',
              estadoSaludMascota: publicacion.mascota?.estadoSalud || 'No disponible',
              descripcionMascota: publicacion.mascota?.descripcion || 'Sin descripción',
              sexoMascota: publicacion.mascota?.sexo || 'No especificado',
              personalidadMascota: publicacion.mascota?.personalidad?.join(', ') || 'Sin especificar',
              likes: publicacion.likes || [],
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
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();
  }

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
