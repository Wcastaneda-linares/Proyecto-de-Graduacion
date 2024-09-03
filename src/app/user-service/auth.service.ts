import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) { }

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

  isAuthenticated(): boolean {
    // Verificar si el token de autenticación está presente
    return !!localStorage.getItem('authToken');
  }
}
