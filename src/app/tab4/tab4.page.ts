import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FireserviceService } from '../fireservice.service';
import firebase from 'firebase/compat/app';
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
    this.firestore.collection('publicaciones')
      .snapshotChanges()
      .subscribe(snapshots => {
        // Resetear publicaciones para evitar duplicados
        this.publicaciones = snapshots.map(snap => {
          const data = snap.payload.doc.data() as any;
          const id = snap.payload.doc.id;
  
          if (!data.mascota) {
            data.mascota = {};  // Asegurarse de que mascota exista
          }
          data.mascota.personalidad = data.mascota.personalidad || [];
  
          return { id, ...data };
        });
        console.log('Publicaciones obtenidas:', this.publicaciones);
      }, error => {
        console.error('Error al obtener publicaciones:', error);
      });
  }
  
  async actualizarPublicacion(id: string, data: any) {
    try {
      await this.firestore.collection('publicaciones').doc(id).update(data);
      this.obtenerPublicaciones(); // Refrescar lista
      console.log('Publicación actualizada con éxito');
    } catch (error) {
      console.error('Error al actualizar la publicación:', error);
    }
  }


  async openUpdateModal(publicacion: any) {
    console.log('Publicación seleccionada para actualizar:', publicacion); // Depuración
  
    const modal = await this.modalCtrl.create({
      component: UpdatePublicacionModalComponent,
      componentProps: { publicacion: JSON.parse(JSON.stringify(publicacion)) },
    });
  
    modal.onDidDismiss().then((result) => {
      console.log('Resultado del modal:', result.data); // Verificar el resultado
      if (result.data) {
        this.actualizarPublicacion(publicacion.id, result.data);
      }
    });
  
    return await modal.present();
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


  aprobarSolicitud(solicitud: any) {
    this.firestore.collection('solicitudes_adopcion').doc(solicitud.id).update({ estado: 'Aprobada' })
      .then(() => {
        this.enviarNotificacion(solicitud.idUsuarioSolicitante, 'Tu solicitud de adopción ha sido aprobada.');
        console.log('Solicitud aprobada');
        this.obtenerSolicitudesAdopcion();
      })
      .catch(error => {
        console.error('Error al aprobar solicitud: ', error);
      });
  }
  
  

  enviarNotificacion(userId: string, mensaje: string) {
    const notificacion = {
      mensaje: mensaje,
      fecha: new Date().toISOString(),
      leida: false // Indicar que la notificación no ha sido leída
    };
  
    this.firestore.collection('users').doc(userId).update({
      notificaciones: firebase.firestore.FieldValue.arrayUnion(notificacion)
    }).then(() => {
      console.log('Notificación enviada con éxito');
    }).catch(error => {
      console.error('Error al enviar notificación: ', error);
    });
  }
  

  rechazarSolicitud(solicitud: any) {
    if (solicitud.id) {
      console.log('Rechazando solicitud con ID:', solicitud.id);
      this.firestore.collection('solicitudes_adopcion').doc(solicitud.id).update({ estado: 'Rechazada' })
        .then(() => {
          this.enviarNotificacion(solicitud.idUsuarioSolicitante, 'Tu solicitud de adopción ha sido rechazada.');
          console.log('Solicitud rechazada');
          this.obtenerSolicitudesAdopcion();
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
