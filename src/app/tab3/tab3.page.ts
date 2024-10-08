import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
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
    private router: Router
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
                
                // Asegúrate de que el campo "name" existe antes de almacenarlo
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
 

  logout() {
    this.authService.logout().then(() => {
      localStorage.removeItem('usuario');  // Limpiamos el localStorage al cerrar sesión
      this.router.navigate(['/login']);  // Redirige al usuario a la página de login
    }).catch(error => {
      console.error('Error al cerrar sesión', error);
    });
  }
}
