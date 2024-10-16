import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { FireserviceService } from '../fireservice.service';
import { AuthService } from '../user-service/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  public email: string = '';
  public password: string = '';
  public errorMessage: string = '';
  signupForm: any; // Mantener el formulario de registro

  constructor(
    private navCtrl: NavController,
    public fireService: FireserviceService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.navCtrl.navigateForward('/tabs'); // Redirige si ya está autenticado
    }
  }

  async onSubmit() {
    try {
      const userCredential = await this.fireService.login({
        email: this.email,
        password: this.password,
      });

      const user = userCredential.user;

      if (user) {
        localStorage.setItem('usuario', user.email || '');
        this.navCtrl.navigateForward('/tabs/tab2'); // Redirige al tab
        this.errorMessage = ''; // Limpia errores
      }
    } catch (error: any) {
      this.errorMessage = this.formatErrorMessage(error.code); // Manejo de errores
      console.error(error);
    }
  }

  registro() {
    this.navCtrl.navigateForward('/signup');
    console.log('Funciona');
  }

  /**
   * Formatea una fecha de entrada al formato 'dd/MM/yyyy'.
   */
  formatDate(event: any): void {
    let input = event.target.value; // Obtener el valor actual del campo
    let formatted = input.replace(/[^0-9]/g, ''); // Eliminar caracteres no numéricos

    // Dividir el string en formato 'dd/MM/yyyy'
    if (formatted.length > 2) {
      formatted = `${formatted.substring(0, 2)}/${formatted.substring(2)}`;
    }
    if (formatted.length > 5) {
      formatted = `${formatted.substring(0, 5)}/${formatted.substring(5, 9)}`;
    }

    // Actualiza el valor del campo en el formulario
    this.signupForm.get('birthDate').setValue(formatted, { emitEvent: false });
  }

  /**
   * Convierte los códigos de error de Firebase en mensajes amigables.
   */
  private formatErrorMessage(code: string): string {
    switch (code) {
      case 'auth/user-not-found':
        return 'No se encontró el usuario.';
      case 'auth/wrong-password':
        return 'La contraseña es incorrecta.';
      case 'auth/invalid-email':
        return 'El formato del correo electrónico no es válido.';
      default:
        return 'Ocurrió un error al iniciar sesión. Intente nuevamente.';
    }
  }
}
