import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-update-publicacion-modal',
  templateUrl: './update-publicacion-modal.component.html',
  styleUrls: ['./update-publicacion-modal.component.scss'],
})
export class UpdatePublicacionModalComponent {

  @Input() publicacion: any;  // Recibe la publicación desde el modal

  constructor(private modalCtrl: ModalController) {}

  cerrarModal() {
    this.modalCtrl.dismiss();  // Cierra el modal
  }



  guardarCambios() {
    const publicacionActualizada = {
      ...this.publicacion, // Incluye todos los campos de la publicación actual
      donante: {
        nombre: this.publicacion.nombreDonante || 'Desconocido',
        numeroContacto: this.publicacion.numeroDonante || 'No disponible',
        correo: this.publicacion.correoDonante || 'No disponible',
        direccion: this.publicacion.direccionDonante || 'No disponible',
        numeroDocumentoIdentificacion: this.publicacion.numeroDocumentoIdentificacion || 'No disponible',
      }
    };
  
    // Envia los datos actualizados al controlador de modal
    this.modalCtrl.dismiss(publicacionActualizada);
  }
  
}
