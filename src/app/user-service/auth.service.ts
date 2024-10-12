import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth'; // Importar AngularFireAuth
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private afAuth: AngularFireAuth, // Inyectar AngularFireAuth
    private router: Router
  ) { }

  logout(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Eliminar el token de autenticación (puede ser localStorage, cookies, etc.)
        localStorage.removeItem('authToken');
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Implementación de cambiar contraseña
  cambiarContrasena(newPassword: string): Promise<void> {
    return this.afAuth.currentUser.then((user) => {
      if (user) {
        return user.updatePassword(newPassword).then(() => {
          console.log('Contraseña cambiada con éxito');
        }).catch((error) => {
          console.error('Error al cambiar la contraseña:', error);
          throw error;
        });
      } else {
        console.error('Usuario no autenticado');
        throw new Error('Usuario no autenticado');
      }
    });
  }

  isAuthenticated(): boolean {
    // Verificar si el token de autenticación está presente
    return !!localStorage.getItem('authToken');
  }
}
