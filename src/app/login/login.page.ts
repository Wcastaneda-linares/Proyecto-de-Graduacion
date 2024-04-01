import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
 import { FireserviceService } from '../fireservice.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  public email: any;
  public password: any;
  public errorMessage: string = ''; // Agregar esta línea
  signupForm: any;

  constructor(
    private navCtrl: NavController,
    public fireService: FireserviceService
  ) {}

  onSubmit() {
    this.fireService.login({ email: this.email, password: this.password })
      .then((userCredential: any) => {
        this.navCtrl.navigateForward('/tabs/tab1');
        this.errorMessage = ''; // Limpia el mensaje de error en caso de éxito
      })
      .catch((error: any) => {
        this.errorMessage = this.formatErrorMessage(error.code); // Usar una función para formatear o traducir el mensaje
        console.error(error);
      });
  }

  registro() {
    this.navCtrl.navigateForward('/signup');
    console.log('Funciona');
  }

  formatDate(event: any): void {
    let input = event.target.value; // Obtener el valor actual del campo
    let formatted = input.replace(/[^0-9]/g, ''); // Eliminar cualquier carácter no numérico
  
    // Dividir el string cada 2 (para día y mes) y cada 4 caracteres (para año) y unir con '/'
    if (formatted.length > 2) {
      formatted = `${formatted.substring(0, 2)}/${formatted.substring(2)}`;
    }
    if (formatted.length > 5) {
      formatted = `${formatted.substring(0, 5)}/${formatted.substring(5, 9)}`;
    }
  
    // Actualizar el valor del campo con el valor formateado
    this.signupForm.get('birthDate').setValue(formatted, {emitEvent: false}); // emitEvent: false previene que se dispare el evento 'valueChanges'
  }
  

  private formatErrorMessage(code: string): string {
    switch (code) {
      case 'auth/user-not-found':
        return 'No se encontró el usuario.';
      case 'auth/wrong-password':
        return 'La contraseña es incorrecta.';
      case 'auth/invalid-email':
        return 'El formato del correo electrónico no es válido.';
      default:
        return 'Ocurrió un error al iniciar sesión. Por favor, intente nuevamente.';
    }
  }
}
