import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';  // Importa Router
import { AuthService } from '../user-service/auth.service';  // Asegúrate de importar AuthService

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
    private authService: AuthService,  // Inyecta AuthService
    private router: Router  // Inyecta Router
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
              }
            },
            (error) => {
              console.error('Error al obtener el usuario:', error);
            }
          );
      }
    });
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);  // Redirige al usuario a la página de login
    }).catch(error => {
      console.error('Error al cerrar sesión', error);
    });
  }
}
