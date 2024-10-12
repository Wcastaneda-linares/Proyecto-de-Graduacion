import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FireserviceService } from '../fireservice.service';
import { Router } from '@angular/router';
import { UpdatePublicacionModalComponent } from '../update-publicacion-modal/update-publicacion-modal.component'; // Asegúrate de importar el componente del modal

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {
  selectedSegment = 'user-management';
  usuariosPaginados: any[] = [];
  publicaciones: any[] = [];
  solicitudesAdopcion: any[] = [];

  constructor(
    private fireService: FireserviceService,
    private modalCtrl: ModalController,
    private firestore: AngularFirestore,
    private router: Router
  ) {}

  ngOnInit() {
    this.obtenerUsuarios();
    this.obtenerPublicaciones();
    this.obtenerSolicitudesAdopcion();
  }

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }

  obtenerUsuarios() {
    // Obtiene los usuarios desde el servicio Firestore
    this.fireService.getUsers().subscribe((usuarios: any[]) => {
      this.usuariosPaginados = usuarios;
    });
  }

  obtenerPublicaciones() {
    // Obtiene las publicaciones desde Firestore
    this.firestore.collection('publicaciones').valueChanges().subscribe(async (publicaciones: any[]) => {
      const publicacionesConDatos = await Promise.all(publicaciones.map(async (publicacion) => {
        const correoUsuario = publicacion.correo || 'Desconocido';
        const nombreUsuario = await this.fireService.obtenerNombreUsuario(correoUsuario);
        return {
          ...publicacion,
          nombreUsuario,
          nombreMascota: publicacion.nombreMascota || 'Nombre desconocido',
          razaMascota: publicacion.razaMascota || 'Desconocida',
          edadMascota: publicacion.edadMascota || 'No disponible',
          tipoMascota: publicacion.tipoMascota || 'No especificado',
          estadoSaludMascota: publicacion.estadoSaludMascota || 'No disponible',
          descripcionMascota: publicacion.descripcionMascota || 'Sin descripción',
          donante: publicacion.donante || {}
        };
      }));
      this.publicaciones = publicacionesConDatos;
    });
  }

  obtenerSolicitudesAdopcion() {
    this.firestore.collection('solicitudes_adopcion').snapshotChanges().subscribe(snapshots => {
      this.solicitudesAdopcion = snapshots.map(snap => {
        const data = snap.payload.doc.data() as Record<string, any>; 
        const id = snap.payload.doc.id;       
        return { id, ...data };               
      });
    });
  }
  
  eliminarUsuario(usuario: any) {
    this.fireService.deleteUser(usuario.id).then(() => {
      this.obtenerUsuarios();
    });
  }

  eliminarPublicacion(publicacion: any) {
    this.firestore.collection('publicaciones').doc(publicacion.id).delete().then(() => {
      this.obtenerPublicaciones(); // Actualiza la lista de publicaciones
    });
  }

  async openUpdateModal(publicacion: any) {
    const modal = await this.modalCtrl.create({
      component: UpdatePublicacionModalComponent,
      componentProps: { publicacion }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        // Actualiza la publicación en Firestore
        this.firestore.collection('publicaciones').doc(publicacion.id).update(result.data).then(() => {
          this.obtenerPublicaciones(); // Actualiza la lista de publicaciones después de actualizarla en Firestore
        });
      }
    });

    return await modal.present();
  }

  aprobarSolicitud(solicitud: any) {
    if (solicitud.id) {
      console.log('Aprobando solicitud con ID:', solicitud.id);  // Verifica el ID
      this.firestore.collection('solicitudes_adopcion').doc(solicitud.id).update({ estado: 'Aprobada' })
        .then(() => {
          console.log('Solicitud aprobada');
          this.obtenerSolicitudesAdopcion(); // Refresca las solicitudes después de aprobar
        })
        .catch(error => {
          console.error('Error al aprobar solicitud: ', error);
        });
    } else {
      console.error('ID de solicitud no encontrado.');
    }
  }
  
  rechazarSolicitud(solicitud: any) {
    if (solicitud.id) {
      console.log('Rechazando solicitud con ID:', solicitud.id);  // Verifica el ID
      this.firestore.collection('solicitudes_adopcion').doc(solicitud.id).update({ estado: 'Rechazada' })
        .then(() => {
          console.log('Solicitud rechazada');
          this.obtenerSolicitudesAdopcion(); // Refresca las solicitudes después de rechazar
        })
        .catch(error => {
          console.error('Error al rechazar solicitud: ', error);
        });
    } else {
      console.error('ID de solicitud no encontrado.');
    }
  }
  

  logout() {
    this.fireService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }
}
