import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ToastController,
  ActionSheetController,
  ModalController,
} from '@ionic/angular';
import { ImageViewerModalPage } from '../image-viewer-modal/image-viewer-modal.page';
import { FireserviceService } from '../fireservice.service';

// Definir una interfaz para la estructura de usuario
interface Usuario {
  name: string; // Ajustar el nombre del campo a 'name'
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page {
  publicaciones: any[] | undefined;
  user: firebase.default.User | null | undefined;

  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    private router: Router,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private modalController: ModalController,
    private fireAuth: FireserviceService
  ) {
    this.afAuth.authState.subscribe((user) => {
      this.user = user;
    });
    this.obtenerPublicaciones();
  }

  async obtenerPublicaciones() {
    this.firestore
      .collection('publicaciones')
      .valueChanges()
      .subscribe(async (publicaciones: any[]) => {
        // Para cada publicación, obtenemos el nombre del usuario correspondiente al correo
        const publicacionesConNombres: any[] = await Promise.all(
          publicaciones.map(async (publicacion) => {
            const correoUsuario = publicacion.correo; // Suponemos que el campo es 'correo', ajusta según tu estructura
            const nombreUsuario = await this.obtenerNombreUsuario(
              correoUsuario
            );
            return { ...publicacion, nombreUsuario };
          })
        );
        this.publicaciones = publicacionesConNombres;
      });
  }

  async obtenerNombreUsuario(correo: string): Promise<string> {
    try {
      const usuarioSnapshot = await this.firestore
        .collection('users')
        .ref.where('email', '==', correo)
        .get();
      console.log(usuarioSnapshot);
      if (!usuarioSnapshot.empty) {
        const usuarioData = usuarioSnapshot.docs[0].data() as Usuario;
        return usuarioData.name; // Ajustar al campo 'name' en lugar de 'nombre'
      }
    } catch (error) {
      console.error('Error al obtener el nombre del usuario: ', error);
    }

    return 'Usuario Desconocido'; // Si no se encuentra el usuario o hay un error, se mostrará este nombre
  }

  darMeGusta(publicacion: any) {
    // Implementa la lógica para dar me gusta a la publicación
  }

  async compartirPublicacion(publicacion: any) {
    const descripcion = publicacion.descripcion;
    const imagenURL = publicacion.imagenURL;

    const shareData: any = {
      title: 'Compartir publicación',
      text: descripcion,
      url: imagenURL,
    };

    try {
      await navigator.share(shareData);
    } catch (error) {
      console.error('Error al compartir la publicación: ', error);
      this.mostrarToast('Error al compartir la publicación');
    }
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
    });
    toast.present();
  }

  async mostrarImagen(imagenURL: string) {
    const modal = await this.modalController.create({
      component: ImageViewerModalPage,
      componentProps: {
        imagenURL: imagenURL,
      },
    });

    await modal.present();
  }

  async mostrarInformacion(publicacion: any) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Detalles de la publicación',
      buttons: [
        {
          text: 'Ver imagen',
          icon: 'image',
          handler: () => {
            this.mostrarImagen(publicacion.imagenURL);
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
}
