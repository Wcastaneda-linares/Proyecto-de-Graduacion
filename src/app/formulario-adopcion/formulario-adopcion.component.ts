import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-formulario-adopcion',
  templateUrl: './formulario-adopcion.component.html',
  styleUrls: ['./formulario-adopcion.component.scss'],
})
export class FormularioAdopcionComponent {
  nombreCompleto: string = '';
  telefono: string = '';
  direccion: string = '';
  tieneFamilia: string = '';
  tieneHijos: string = '';
  motivoAdopcion: string = '';
  identificacionURL: string = '';
  selectedFile: File | null = null; 
  selectedFileName: string = ''; 


  constructor(
    private modalCtrl: ModalController, 
    private storage: AngularFireStorage
  ) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    
    // Validar que el archivo sea una imagen o un PDF
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Por favor selecciona un archivo de imagen (jpg, png, gif) o un documento PDF.');
      this.selectedFile = null;
      this.selectedFileName = ''; // Restablecer el nombre del archivo
      return;
    }
  
    // Validar que el archivo no sea mayor a 1 MB
    const maxSizeInMB = 1;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      alert('El archivo no debe superar 1 MB de tamaño.');
      this.selectedFile = null;
      this.selectedFileName = ''; // Restablecer el nombre del archivo
      return;
    }
  
    // Si pasa las validaciones, se guarda el archivo y el nombre
    this.selectedFile = file;
    this.selectedFileName = file.name; // Almacenar el nombre del archivo
  }

  enviarSolicitud() {
    if (this.selectedFile) {
      const filePath = `documentos_identificacion/${Date.now()}_${this.selectedFile.name}`;
      const fileRef = this.storage.ref(filePath);
      const uploadTask = this.storage.upload(filePath, this.selectedFile);

      // Subir la imagen y obtener la URL de descarga
      uploadTask.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url) => {
            this.identificacionURL = url;
            this.enviarSolicitudConImagen(); // Llamar a la función para enviar la solicitud
          });
        })
      ).subscribe();
    } else {
      alert('Por favor selecciona un archivo de identificación');
    }
  }

  enviarSolicitudConImagen() {
    if (this.nombreCompleto && this.telefono && this.direccion && this.motivoAdopcion && this.identificacionURL) {
      const data = {
        nombreCompleto: this.nombreCompleto,
        telefono: this.telefono,
        direccion: this.direccion,
        tieneFamilia: this.tieneFamilia,
        tieneHijos: this.tieneHijos,
        motivoAdopcion: this.motivoAdopcion,
        identificacionURL: this.identificacionURL,
      };

      this.modalCtrl.dismiss(data);  // Devolver la información completa
    } else {
      alert('Por favor completa todos los campos');
    }
  }


}
