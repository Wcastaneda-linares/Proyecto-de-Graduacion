import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ModalController, ActionSheetController, ToastController } from '@ionic/angular';
import { FireserviceService } from '../fireservice.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';  // Importa el servicio de autenticación
import { ImageViewerModalPage } from '../image-viewer-modal/image-viewer-modal.page';  // Asegúrate de importar el modal

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
})
export class Tab2Page implements OnInit {
  publicaciones: any[] = [];
  user: any;  // Para manejar el usuario autenticado

  constructor(
    private firestore: AngularFirestore,
    private fireService: FireserviceService,
    private modalController: ModalController,
    private actionSheetController: ActionSheetController,
    private toastController: ToastController,
    private afAuth: AngularFireAuth  // Inyecta el servicio de autenticación
  ) {}

  ngOnInit() {
    this.obtenerPublicaciones();

    // Obtener el estado de autenticación del usuario
    this.afAuth.authState.subscribe(user => {
      this.user = user;
    });
  }

  obtenerPublicaciones() {
    this.firestore.collection('publicaciones').valueChanges().subscribe((publicaciones: any[]) => {
      this.publicaciones = publicaciones.map((publicacion: any) => ({
        ...publicacion,
        nombreUsuario: publicacion.nombreUsuario || 'Usuario desconocido',
        nombreMascota: publicacion.nombreMascota || 'Nombre desconocido',
        razaMascota: publicacion.razaMascota || 'Desconocida',
        edadMascota: publicacion.edadMascota || 'No disponible',
        tipoMascota: publicacion.tipoMascota || 'No especificado',
        estadoSaludMascota: publicacion.estadoSaludMascota || 'No disponible',
        descripcionMascota: publicacion.descripcionMascota || 'Sin descripción',
      }));
    });
  }

  // Función para mostrar imagen
  async mostrarImagen(imagenURL: string) {
    const modal = await this.modalController.create({
      component: ImageViewerModalPage,  // Modal para mostrar la imagen
      componentProps: {
        imagenURL: imagenURL
      }
    });
    return await modal.present();
  }

  async mostrarInformacion(publicacion: any) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Detalles de la publicación',
      buttons: [
        {
          text: 'Ver imagen',
          icon: 'image',
          handler: () => {
            this.mostrarImagen(publicacion.imagenURL);  // Llamar a mostrarImagen
          },
        },
        {
          text: 'Compartir',
          icon: 'share',
          handler: () => {
            this.compartirPublicacion(publicacion);
          },
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

  // Función para solicitar adopción
  solicitarAdopcion(publicacion: any) {
    if (!this.user) {
      this.mostrarToast('Debe iniciar sesión para solicitar adopción');
      return;
    }

    this.firestore.collection('solicitudes_adopcion').add({
      idMascota: publicacion.id || 'ID desconocido',
      nombreMascota: publicacion.nombreMascota || 'Nombre desconocido',
      idUsuarioSolicitante: this.user.uid,
      nombreUsuarioSolicitante: this.user.email,
      fecha: new Date(),
      estado: 'Pendiente',
    }).then(() => {
      this.mostrarToast('Solicitud de adopción enviada con éxito');
    }).catch((error) => {
      console.error('Error al enviar solicitud de adopción:', error);
      this.mostrarToast('Error al enviar la solicitud');
    });
  }

  // Función para compartir publicación
  compartirPublicacion(publicacion: any) {
    const shareData = {
      title: 'Publicación de Mascota',
      text: `¡Mira a ${publicacion.nombreMascota}! ${publicacion.descripcionMascota}`,
      url: publicacion.imagenURL
    };

    if (navigator.share) {
      navigator.share(shareData).then(() => {
        console.log('Compartido con éxito');
      }).catch((error) => {
        console.error('Error al compartir:', error);
      });
    } else {
      console.error('El navegador no soporta compartir');
    }
  }

  async mostrarToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  logout() {
    this.fireService.logout().then(() => {
      console.log('Sesión cerrada');
    }).catch((error) => {
      console.error('Error al cerrar sesión', error);
    });
  }
}
