import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { AuthService } from '../user-service/auth.service';
import { RegistrarCentroModalPage } from '../registrar-centro-modal/registrar-centro-modal.page';
import { ActualizarCentroModalComponent } from '../actualizar-centro-modal/actualizar-centro-modal.component';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
})
export class Tab3Page implements OnInit {
  usuario: any;
  notificaciones: any[] = [];
  contadorNotificaciones: number = 0;
  mostrarNotificaciones: boolean = false;
  centrosAdopcion: any[] = [];
  mostrarCentrosAdopcion: boolean = false; // Controla la visibilidad de la lista de centros
  userRole: string | null = null;

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private modalCtrl: ModalController,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.obtenerUsuarioActual();
    this.obtenerCentrosAdopcion();
    this.userRole = localStorage.getItem('userRole');
  }

    // Función para verificar si es administrador
    isAdmin(): boolean {
      return this.userRole === 'admin';
    }
    

    

    obtenerUsuarioActual() {
      this.afAuth.authState.subscribe((user) => {
        if (user) {
          this.firestore
            .collection('users')
            .doc(user.uid)
            .snapshotChanges() // Escucha cambios y da metadatos
            .subscribe((snapshot) => {
              const data = snapshot.payload.data();
              if (data) {
                this.usuario = data;
                this.notificaciones = this.usuario.notificaciones || [];
                this.actualizarContador();
              }
            });
        }
      });
    }
    

  actualizarContador() {
    this.contadorNotificaciones = this.notificaciones.filter(
      (notificacion) => !notificacion.leida
    ).length;
  }

  toggleNotificaciones() {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
    if (this.mostrarNotificaciones) {
      this.marcarNotificacionesLeidas();
    }
  }

  toggleCentrosAdopcion() {
    this.mostrarCentrosAdopcion = !this.mostrarCentrosAdopcion;
  }

  marcarNotificacionesLeidas() {
    const notificacionesActualizadas = this.notificaciones.map((notificacion) => ({
      ...notificacion,
      leida: true,
    }));
  
    if (this.usuario?.uid) {
      this.firestore
        .collection('users')
        .doc(this.usuario.uid)
        .update({ notificaciones: notificacionesActualizadas })
        .then(() => {
          this.notificaciones = notificacionesActualizadas;
          this.actualizarContador(); // Actualiza el contador de inmediato
        })
        .catch((error) => {
          console.error('Error al actualizar las notificaciones:', error);
        });
    }
  }
  

  async cambiarContrasena() {
    const alert = await this.alertController.create({
      header: 'Cambiar Contraseña',
      inputs: [
        { name: 'currentPassword', type: 'password', placeholder: 'Contraseña Actual' },
        { name: 'password', type: 'password', placeholder: 'Nueva Contraseña' },
        { name: 'confirmPassword', type: 'password', placeholder: 'Confirmar Contraseña' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cambiar',
          handler: (data) => {
            if (data.password !== data.confirmPassword) {
              this.mostrarError('Las contraseñas no coinciden');
            } else {
              this.authService.reautenticarUsuario(data.currentPassword) // Reautenticar primero
                .then(() => {
                  return this.authService.cambiarContrasena(data.password); // Cambiar la contraseña
                })
                .then(() => this.mostrarMensajeExito())
                .catch((error) => this.mostrarError('Error: ' + error.message));
            }
          },
        },
      ],
    });
  
    await alert.present();
  }
  

  async abrirModal() {
    const modal = await this.modalCtrl.create({
      component: RegistrarCentroModalPage,
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      this.firestore.collection('centros_adopcion').add(data).then(() => {
        console.log('Centro registrado exitosamente');
        this.obtenerCentrosAdopcion(); // Refresca la lista
      });
    }
  }

  obtenerCentrosAdopcion() {
    this.firestore
      .collection('centros_adopcion')
      .valueChanges({ idField: 'id' })
      .subscribe((centros) => {
        this.centrosAdopcion = centros;
      });
  }

  async ajustesGenerales() {
    const alert = await this.alertController.create({
      header: 'Ajustes Generales',
      inputs: [
        { name: 'tema', type: 'radio', label: 'Claro', value: 'light', checked: true },
        { name: 'tema', type: 'radio', label: 'Oscuro', value: 'dark' },
      ],
      buttons: [
        { text: 'Guardar', handler: (data) => console.log('Ajustes guardados: ', data) },
      ],
    });

    await alert.present();
  }

  async mostrarError(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async mostrarMensajeExito() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'Contraseña cambiada con éxito.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  async abrirModalActualizar(centro: any) {
    const modal = await this.modalCtrl.create({
      component: ActualizarCentroModalComponent,
      componentProps: {
        centro: centro, // Pasar los datos del centro al modal
      },
    });
  
    await modal.present();
  
    const { data } = await modal.onDidDismiss();
    if (data) {
      this.firestore
        .collection('centros_adopcion')
        .doc(centro.id)
        .update(data)
        .then(() => console.log('Centro actualizado exitosamente'))
        .catch((error) => console.error('Error al actualizar el centro:', error));
    }
  }

  ionViewWillEnter() {
    console.log('Tab3 (Perfil) activada');
    this.cargarDatos();
    this.cd.detectChanges(); // Forzar la detección de cambios
  }

  cargarDatos() {
    console.log('Datos recargados en Tab3');
    // Aquí va la lógica para refrescar los datos en esta tab.
  }

  async eliminarCentro(centro: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que deseas eliminar el centro "${centro.nombre}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Eliminación cancelada');
          },
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.procesarEliminacion(centro); // Llamar al método para procesar la eliminación
          },
        },
      ],
    });
  
    await alert.present();
  }
  
  procesarEliminacion(centro: any) {
    this.firestore
      .collection('centros_adopcion')
      .doc(centro.id) // Usa el ID del centro para eliminarlo
      .delete()
      .then(() => {
        console.log(`Centro eliminado: ${centro.nombre}`);
        this.obtenerCentrosAdopcion(); // Refresca la lista de centros
      })
      .catch((error) => {
        console.error('Error al eliminar el centro:', error);
      });
  }

  async confirmLogout() {
    const alert = await this.alertController.create({
      header: 'Confirmar Cierre de Sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          handler: () => {
            this.logout(); // Llama al método de logout
          },
        },
      ],
    });

    await alert.present();
  }

  async logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    const farewellAlert = await this.alertController.create({
      header: '¡Hasta pronto!',
      message: 'Esperamos verte de nuevo pronto.',
      buttons: ['OK'],
    });

    await farewellAlert.present();

    // Redirige al usuario al login después de que se cierre el mensaje
    farewellAlert.onDidDismiss().then(() => {
      this.router.navigate(['/login']);
    });
  }
  
  
}
