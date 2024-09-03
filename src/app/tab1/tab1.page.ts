import { Component } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../user-service/auth.service';  // Asegúrate de que la ruta sea correcta

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  imagenURL: string | undefined;

  constructor(
    private navCtrl: NavController,
    private authService: AuthService,  // Inyecta AuthService
    private router: Router             // Inyecta Router para navegación
  ) {}

  async tomarFoto() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });

    if (image && image.dataUrl) {
      this.imagenURL = image.dataUrl;
      this.navCtrl.navigateForward('/llenar-informacion', {
        state: { imagenURL: this.imagenURL },
      });
    }
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);  // Redirige al usuario a la página de login
    }).catch(error => {
      console.error('Error al cerrar sesión', error);
    });
  }
}
