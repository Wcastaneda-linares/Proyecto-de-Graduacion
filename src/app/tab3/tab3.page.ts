import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { AuthService } from '../user-service/auth.service';
import { RegistrarCentroModalPage } from '../registrar-centro-modal/registrar-centro-modal.page';
import { ActualizarCentroModalComponent } from '../actualizar-centro-modal/actualizar-centro-modal.component';


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

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.obtenerUsuarioActual();
    this.obtenerCentrosAdopcion();
  }

  obtenerUsuarioActual() {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.firestore
          .collection('users')
          .doc(user.uid)
          .get()
          .subscribe((doc) => {
            if (doc.exists) {
              this.usuario = doc.data();
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
          this.actualizarContador();
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
              this.authService.cambiarContrasena(data.password)
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

  

  eliminarCentro(centro: any) {
    this.firestore.collection('centros_adopcion').doc(centro.id).delete().then(() => {
      this.obtenerCentrosAdopcion();
    });
  }

  logout() {
    this.authService.logout().then(() => {
      localStorage.removeItem('usuario');
      this.router.navigate(['/login']);
    }).catch((error) => {
      console.error('Error al cerrar sesión', error);
    });
  }
}
