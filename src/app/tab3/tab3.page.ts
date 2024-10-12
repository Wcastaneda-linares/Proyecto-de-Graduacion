import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../user-service/auth.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
})
export class Tab3Page implements OnInit {
  usuario: any;

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.obtenerUsuarioActual();
  }

  obtenerUsuarioActual() {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.firestore
          .collection('users')
          .doc(user.uid)
          .get()
          .subscribe(
            (doc) => {
              if (doc.exists) {
                this.usuario = doc.data();
                console.log('Información del usuario:', this.usuario);
                
                if (this.usuario && this.usuario.name) {
                  localStorage.setItem('usuario', this.usuario.name);  // Guardamos el nombre en localStorage
                } else {
                  console.error('El usuario no tiene un campo "name"');
                }
              }
            },
            (error) => {
              console.error('Error al obtener el usuario:', error);
            }
          );
      }
    });
  }

  async cambiarContrasena() {
    const alert = await this.alertController.create({
      header: 'Cambiar Contraseña',
      inputs: [
        {
          name: 'password',
          type: 'password',
          placeholder: 'Nueva Contraseña',
        },
        {
          name: 'confirmPassword',
          type: 'password',
          placeholder: 'Confirmar Contraseña',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Cambiar',
          handler: (data) => {
            if (data.password !== data.confirmPassword) {
              this.mostrarError('Las contraseñas no coinciden');
            } else {
              this.authService.cambiarContrasena(data.password)
                .then(() => {
                  this.mostrarMensajeExito();  // Mostrar un mensaje de éxito
                })
                .catch((error) => {
                  this.mostrarError('Error al cambiar la contraseña: ' + error.message);
                });
            }
          },
        },
      ],
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
  
  async configurarNotificaciones() {
    const alert = await this.alertController.create({
      header: 'Notificaciones',
      inputs: [
        {
          name: 'notificaciones',
          type: 'checkbox', // Cambiado a checkbox
          label: 'Activar notificaciones',
          value: 'notificaciones',
          checked: true,
        },
      ],
      buttons: [
        {
          text: 'Guardar',
          handler: (data) => {
            console.log('Configuraciones de notificaciones: ', data);
          },
        },
      ],
    });

    await alert.present();
  }

  async ajustesGenerales() {
    const alert = await this.alertController.create({
      header: 'Ajustes Generales',
      inputs: [
        {
          name: 'tema',
          type: 'radio',
          label: 'Claro',
          value: 'light',
          checked: true,
        },
        {
          name: 'tema',
          type: 'radio',
          label: 'Oscuro',
          value: 'dark',
        },
      ],
      buttons: [
        {
          text: 'Guardar',
          handler: (data) => {
            console.log('Ajustes guardados: ', data);
          },
        },
      ],
    });

    await alert.present();
  }

  logout() {
    this.authService.logout().then(() => {
      localStorage.removeItem('usuario');
      this.router.navigate(['/login']);
    }).catch(error => {
      console.error('Error al cerrar sesión', error);
    });
  }

  async mostrarError(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
