import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-update-publicacion-modal',
  templateUrl: './update-publicacion-modal.component.html',
  styleUrls: ['./update-publicacion-modal.component.scss'],
})
export class UpdatePublicacionModalComponent implements OnInit {
  @Input() publicacion: any; // Recibe la publicación desde el modal
  archivoDocumento: File | null = null;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    console.log('Datos recibidos en el modal:', this.publicacion);

    if (!this.publicacion.mascota) this.publicacion.mascota = {};
    if (!this.publicacion.donante) this.publicacion.donante = {};
  }

  esImagen(url: string): boolean {
    return /\.(jpg|jpeg|png|gif)$/i.test(url);
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  cargarDocumento(event: any) {
    const file = event.target.files[0];
    if (file.size <= 1048576) {
      this.archivoDocumento = file;
    } else {
      alert('El archivo no debe superar 1 MB.');
    }
  }

  guardarCambios() {
    const publicacionActualizada = {
      ...this.publicacion,
      donante: { ...this.publicacion.donante },
    };

    this.modalCtrl.dismiss(publicacionActualizada);
  }
}
