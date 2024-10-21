import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'; // Importa las funciones desde Firebase

@Injectable({
  providedIn: 'root'
})


export class AuthService {
  constructor(
    private afAuth: AngularFireAuth,
    private router: Router
  ) { }

  

  async reautenticarUsuario(currentPassword: string): Promise<void> {
    const user = await this.afAuth.currentUser;

    if (user && user.email) {
      const auth = getAuth();
      const credential = EmailAuthProvider.credential(user.email, currentPassword);

      try {
        await reauthenticateWithCredential(user, credential);
        console.log('Usuario reautenticado con éxito.');
      } catch (error) {
        console.error('Error al reautenticar:', error);
        throw new Error('Error al reautenticar. Verifica tu contraseña actual.');
      }
    } else {
      throw new Error('Usuario no autenticado.');
    }
  }


  async cambiarContrasena(newPassword: string): Promise<void> {
    const user = await this.afAuth.currentUser;

    if (user) {
      try {
        await user.updatePassword(newPassword);
        console.log('Contraseña cambiada con éxito.');
      } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
        throw error;
      }
    } else {
      throw new Error('Usuario no autenticado.');
    }
  }


  // **Verificar si el usuario está autenticado**
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  // **Cerrar sesión del usuario**
  logout(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Elimina todos los datos de autenticación y redirige al login
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('usuario');
        this.afAuth.signOut().then(() => {
          this.router.navigate(['/login']);
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
