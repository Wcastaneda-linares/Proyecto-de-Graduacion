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
  ubicacionMascota: string = 'particular';
  nombreDonante: string = '';
  numeroDonante: string = '';
  direccionDonante: string = '';
  centrosAdopcion: any[] = []; // Inicializa la lista de centros
  centroId: string = ''; // ID del centro de adopción seleccionado


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

  ngOnInit() {
    this.cargarCentrosAdopcion();
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

  async obtenerInformacionCentro(centroId: string) {
    try {
      console.log('Buscando información para centroId:', centroId);
      const centroSnapshot = await this.firestore
        .collection('centros_adopcion')
        .doc(centroId) // Utiliza centroId directamente como parámetro
        .get()
        .toPromise();
  
      if (centroSnapshot && centroSnapshot.exists) {
        const datosCentro = centroSnapshot.data() as {
          nombre: string;
          direccion: string;
          telefono: string;
        };
        console.log('Datos del centro encontrados:', datosCentro);
        return datosCentro;
      } else {
        console.warn(`Centro con ID ${centroId} no encontrado.`);
        return null;
      }
    } catch (error) {
      console.error('Error al obtener datos del centro:', error);
      return null;
    }
  }
  

  async crearPublicacion() {
    console.log('Tipo de Mascota:', this.tipoMascota);
    console.log('Estado Salud:', this.estadoSaludMascota);
  
    // Validar los campos obligatorios de tipo de mascota y estado de salud
    if (!this.tipoMascota || !this.estadoSaludMascota) {
      this.mostrarToast('Por favor, seleccione el tipo de mascota y el estado de salud.');
      return;
    }
  
    // Validar información del donante si es un donante particular
    if (this.ubicacionMascota === 'particular') {
      if (!this.nombreDonante || !this.numeroDonante || !this.direccionDonante) {
        this.mostrarToast('Por favor, complete la información del donante.');
        return;
      }
  
      // Validar documento obligatorio solo para donantes particulares
      if (!this.documentoURL) {
        this.mostrarToast('Por favor, sube un documento de identificación.');
        return;
      }
    }
  
    let datosCentro = {
      nombre: 'Nombre del centro no disponible',
      direccion: 'Dirección no disponible',
      telefono: 'Teléfono no disponible',
    };
  
    // Obtener datos del centro si se ha seleccionado uno
    if (this.centroId) {
      try {
        console.log('Buscando información para centroId:', this.centroId);
        const centroSnapshot = await this.firestore
          .collection('centros_adopcion')
          .doc(this.centroId) // Usar el ID del centro, no el nombre
          .get()
          .toPromise();
  
        if (centroSnapshot && centroSnapshot.exists) {
          datosCentro = centroSnapshot.data() as {
            nombre: string;
            direccion: string;
            telefono: string;
          };
        } else {
          console.warn(`Centro con ID ${this.centroId} no encontrado.`);
        }
      } catch (error) {
        console.error('Error al obtener datos del centro:', error);
      }
    }
  
    // Construir el objeto de publicación
    const publicacionData = {
      centroId: this.centroId || null, // Asignar el ID del centro si existe
      nombreCentro: datosCentro.nombre,
      direccionCentro: datosCentro.direccion,
      telefonoCentro: datosCentro.telefono,
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
        nombre: this.ubicacionMascota === 'particular' ? this.nombreDonante : null,
        numeroContacto: this.ubicacionMascota === 'particular' ? this.numeroDonante : null,
        direccion: this.ubicacionMascota === 'particular' ? this.direccionDonante : null,
      },
      documentoURL: this.ubicacionMascota === 'particular' ? this.documentoURL : null,
      imagenURL: this.imagenURL,
      correo: this.usuarioLogueado.email,
    };
  
    // Intentar crear la publicación en Firestore
    try {
      await this.firestore.collection('publicaciones').add(publicacionData);
      this.mostrarToast('Publicación creada exitosamente');
      this.router.navigate(['tabs/tab2']);
    } catch (error) {
      console.error('Error al crear la publicación: ', error);
      this.mostrarToast('Error al crear la publicación');
    }
  }
  
  
  
  
  
  cargarCentrosAdopcion() {
    this.firestore.collection('centros_adopcion').valueChanges({ idField: 'id' }).subscribe((centros: any[]) => {
      if (centros) {
        this.centrosAdopcion = centros.map(centro => ({
          id: centro.id,
          nombre: centro.nombre,
          direccion: centro.direccion,
          telefono: centro.telefono
        }));
        console.log('Centros de adopción cargados:', this.centrosAdopcion);
      } else {
        console.warn('No se encontraron centros de adopción.');
      }
    }, error => {
      console.error('Error al cargar los centros de adopción:', error);
    });
  }
  
  onUbicacionChange() {
    if (this.ubicacionMascota === 'centro') {
      this.nombreDonante = '';
      this.numeroDonante = '';
      this.direccionDonante = '';
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
