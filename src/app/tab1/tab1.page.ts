import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../user-service/auth.service';
import { PhotoService } from '../services/photo.service'; // Asegúrate de importar esto

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  imagenURL: string | undefined;

  constructor(
    private navCtrl: NavController,
    private authService: AuthService,
    private router: Router,
    private photoService: PhotoService // Inyecta el servicio de fotos
  ) {}

  async tomarFoto() {
    const imagenURL = await this.photoService.tomarFoto(); // Usa el servicio
    if (imagenURL) {
      this.navCtrl.navigateForward('/llenar-informacion', {
        state: { imagenURL },
      });
    }
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    }).catch(error => {
      console.error('Error al cerrar sesión', error);
    });
  }
}
