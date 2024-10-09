import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ToastController } from '@ionic/angular';
import { FireserviceService } from '../fireservice.service'; // Importa el servicio FireserviceService

@Component({
  selector: 'app-llenar-informacion',
  templateUrl: './llenar-informacion.page.html',
  styleUrls: ['./llenar-informacion.page.scss'],
})
export class LlenarInformacionPage {
  // Datos de la publicación
  imagenURL: string | undefined;
  usuarioLogueado: any; // Variable para almacenar el usuario logueado

  // Información adicional sobre la mascota
  nombreMascota: string = '';
  razaMascota: string = '';
  edadMascota: number | null = null;
  descripcionMascota: string = '';
  tipoMascota: string = '';  // Campo para el tipo de mascota
  estadoSaludMascota: string = '';  // Campo para el estado de salud

  // Información del donante
  nombreDonante: string = '';
  numeroDonante: string = '';
  correoDonante: string = '';
  direccionDonante: string = '';
  numeroDocumentoIdentificacion: string = '';  // Campo para el número del documento de identificación

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private storage: AngularFireStorage,
    private firestore: AngularFirestore,
    private toastController: ToastController,
    private fireService: FireserviceService // Inyecta el servicio FireserviceService
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state) {
      this.imagenURL = state['imagenURL'];
    }

    // Obtener el usuario logueado
    this.fireService.getUsuarioLogueado().then((user) => {
      this.usuarioLogueado = user;
    });
  }

  // Método para crear la publicación
  async crearPublicacion() {
    // Depuración: Mostramos en la consola el estado de los campos para verificar
    console.log('Imagen URL:', this.imagenURL);
    console.log('Nombre de la Mascota:', this.nombreMascota);
    console.log('Raza de la Mascota:', this.razaMascota);
    console.log('Edad de la Mascota:', this.edadMascota);
    console.log('Descripción de la Mascota:', this.descripcionMascota);
    console.log('Tipo de Mascota:', this.tipoMascota);
    console.log('Estado de Salud:', this.estadoSaludMascota);
    console.log('Nombre del Donante:', this.nombreDonante);
    console.log('Número de Contacto del Donante:', this.numeroDonante);
    console.log('Correo del Donante:', this.correoDonante);
    console.log('Dirección del Donante:', this.direccionDonante);
    console.log('Número del Documento de Identificación:', this.numeroDocumentoIdentificacion);

    // Verificar si todos los campos están llenos
    if (
      !this.imagenURL ||
      !this.nombreMascota ||
      !this.razaMascota ||
      this.edadMascota === null ||  // Validamos que la edad no sea nula
      !this.descripcionMascota ||
      !this.tipoMascota ||
      !this.estadoSaludMascota ||
      !this.nombreDonante ||
      !this.numeroDonante ||
      !this.correoDonante ||
      !this.direccionDonante ||
      !this.numeroDocumentoIdentificacion
    ) {
      this.mostrarToast('Por favor, complete todos los campos');
      return;
    }

    try {
      const filePath = `publicaciones/${Date.now()}`;
      const fileRef = this.storage.ref(filePath);
      const task = await fileRef.putString(this.imagenURL, 'data_url');

      const downloadURL = await task.ref.getDownloadURL();

      const publicacionData = {
        mascota: {
          nombre: this.nombreMascota,
          raza: this.razaMascota,
          edad: this.edadMascota,
          descripcion: this.descripcionMascota,
          tipo: this.tipoMascota,
          estadoSalud: this.estadoSaludMascota,
        },
        donante: {
          nombre: this.nombreDonante,
          numeroContacto: this.numeroDonante,
          correo: this.correoDonante,
          direccion: this.direccionDonante,
          numeroDocumentoIdentificacion: this.numeroDocumentoIdentificacion,  // Guardamos el número de identificación
        },
        imagenURL: downloadURL,  // Asignamos la URL de la imagen
        correo: this.usuarioLogueado.email // Asignamos el correo del usuario logueado
      };

      // Guardar la publicación en Firestore
      await this.firestore.collection('publicaciones').add(publicacionData);

      this.mostrarToast('Publicación creada exitosamente');
      this.router.navigate(['tabs/tab2']);
    } catch (error) {
      console.error('Error al crear la publicación: ', error);
      this.mostrarToast('Error al crear la publicación');
    }
  }

  // Método para mostrar mensajes emergentes (toast)
  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
    });
    toast.present();
  }
}
