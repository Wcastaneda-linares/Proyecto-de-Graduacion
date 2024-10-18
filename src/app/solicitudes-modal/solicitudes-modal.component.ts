import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'; 
import { DocumentViewerModalPageComponent } from '../components/document-viewer-modal-page/document-viewer-modal-page.component';
import { AngularFirestore } from '@angular/fire/compat/firestore'; 
import { AlertController } from '@ionic/angular';
import firebase from 'firebase/compat/app';  // Asegúrate de tener esta línea


@Component({
  selector: 'app-solicitudes-modal',
  templateUrl: './solicitudes-modal.component.html',
  styleUrls: ['./solicitudes-modal.component.scss'],
})
export class SolicitudesModalComponent {
  @Input() solicitud: any;  // Recibir la solicitud como un input
  identificacionURLSanitizada: SafeResourceUrl | undefined;

  constructor(
    private modalCtrl: ModalController,
    private sanitizer: DomSanitizer,
    private alertController: AlertController,  // Inyecta AlertController
    private firestore: AngularFirestore  // Inyecta AngularFirestore
  ) {}

  ngOnInit() {
    if (this.solicitud && this.solicitud.identificacionURL) {
      this.identificacionURLSanitizada = this.sanitizer.bypassSecurityTrustResourceUrl(this.solicitud.identificacionURL);
    }
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  async abrirDocumento(documentURL: string) {
    const modal = await this.modalCtrl.create({
      component: DocumentViewerModalPageComponent,
      componentProps: { documentURL },
      cssClass: 'custom-modal-class'  // Clase personalizada para controlar el tamaño del modal
    });
    return await modal.present();
  }

  // Método para recargar la solicitud desde Firestore
recargarSolicitud(id: string) {
  this.firestore.collection('solicitudes_adopcion').doc(id).valueChanges().subscribe(data => {
    this.solicitud = data;
  });
}

  async aprobarSolicitud(solicitud: any) {
    const alert = await this.alertController.create({
      header: 'Aprobar Solicitud',
      message: '¿Estás seguro de que deseas aprobar esta solicitud?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Aprobar',
          handler: () => {
            this.firestore.collection('solicitudes_adopcion').doc(solicitud.id).update({ estado: 'Aprobada' })
              .then(() => {
                // Actualiza localmente el estado de la solicitud
                solicitud.estado = 'Aprobada';
                this.enviarNotificacion(solicitud.idUsuarioSolicitante, 'Tu solicitud de adopción ha sido aprobada.');
              });
          },
        },
      ],
    });
    await alert.present();
  }
  
  async rechazarSolicitud(solicitud: any) {
    const alert = await this.alertController.create({
      header: 'Rechazar Solicitud',
      message: '¿Estás seguro de que deseas rechazar esta solicitud?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Rechazar',
          handler: () => {
            this.firestore.collection('solicitudes_adopcion').doc(solicitud.id).update({ estado: 'Rechazada' })
              .then(() => {
                // Actualiza localmente el estado de la solicitud
                solicitud.estado = 'Rechazada';
                this.enviarNotificacion(solicitud.idUsuarioSolicitante, 'Tu solicitud de adopción ha sido rechazada.');
              });
          },
        },
      ],
    });
    await alert.present();
  }
  

  enviarNotificacion(userId: string, mensaje: string) {
    const notificacion = {
      mensaje,
      fecha: new Date().toISOString(),
      leida: false,
    };

    this.firestore.collection('users').doc(userId).update({
      notificaciones: firebase.firestore.FieldValue.arrayUnion(notificacion)  // Usar FieldValue correctamente
    }).then(() => {
      console.log('Notificación enviada con éxito');
    }).catch(error => {
      console.error('Error al enviar notificación: ', error);
    });
  }

  descargarDocumento(url: string) {
    fetch(url)
      .then(response => response.blob())  // Convertir la respuesta en un Blob
      .then(blob => {
        const link = document.createElement('a');
        const objectURL = URL.createObjectURL(blob);
        link.href = objectURL;
        link.download = 'documento_identificacion';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectURL);  // Liberar el objeto Blob después de la descarga
      })
      .catch(error => {
        console.error('Error al descargar el archivo:', error);
      });
  }
}
