import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ToastController } from '@ionic/angular';
import { FireserviceService } from '../fireservice.service';

@Component({
  selector: 'app-llenar-informacion',
  templateUrl: './llenar-informacion.page.html',
  styleUrls: ['./llenar-informacion.page.scss'],
})
export class LlenarInformacionPage {
  imagenURL: string | undefined;
  documentoURL: string | undefined;
  usuarioLogueado: any;

  nombreMascota: string = '';
  razaMascota: string = '';
  edadMascota: number | null = null;
  sexoMascota: string = '';
  personalidadMascota: string[] = [];
  descripcionMascota: string = '';
  tipoMascota: string = '';
  estadoSaludMascota: string = '';

  nombreDonante: string = '';
  numeroDonante: string = '';
  direccionDonante: string = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private storage: AngularFireStorage,
    private firestore: AngularFirestore,
    private toastController: ToastController,
    private fireService: FireserviceService
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state) {
      this.imagenURL = state['imagenURL'];
    }

    this.fireService.getUsuarioLogueado().then((user) => {
      this.usuarioLogueado = user;
    });
  }

  async cargarDocumento(event: any) {
    const file = event.target.files[0];
    if (file && file.size <= 1 * 1024 * 1024) {
      const filePath = `documentos/${Date.now()}_${file.name}`;
      const fileRef = this.storage.ref(filePath);
      const task = await fileRef.put(file);

      this.documentoURL = await task.ref.getDownloadURL();
      console.log('Documento subido: ', this.documentoURL);
      this.mostrarToast('Documento subido correctamente');
    } else {
      this.mostrarToast('El archivo debe ser menor a 1 MB');
    }
  }
  async crearPublicacion() {
    console.log('Tipo de Mascota:', this.tipoMascota);
    console.log('Estado Salud:', this.estadoSaludMascota);
  
    if (!this.tipoMascota || !this.estadoSaludMascota) {
      this.mostrarToast('Por favor, seleccione el tipo de mascota y el estado de salud.');
      return;
    }
  
    const publicacionData = {
      mascota: {
        nombre: this.nombreMascota,
        raza: this.razaMascota,
        edad: this.edadMascota,
        sexo: this.sexoMascota,
        personalidad: this.personalidadMascota,
        descripcion: this.descripcionMascota,
        tipo: this.tipoMascota,
        estadoSalud: this.estadoSaludMascota,
      },
      donante: {
        nombre: this.nombreDonante,
        numeroContacto: this.numeroDonante,
        direccion: this.direccionDonante,
      },
      documentoURL: this.documentoURL,
      imagenURL: this.imagenURL,
      correo: this.usuarioLogueado.email,
    };
  
    try {
      await this.firestore.collection('publicaciones').add(publicacionData);
      this.mostrarToast('Publicación creada exitosamente');
      this.router.navigate(['tabs/tab2']);
    } catch (error) {
      console.error('Error al crear la publicación: ', error);
      this.mostrarToast('Error al crear la publicación');
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
}
