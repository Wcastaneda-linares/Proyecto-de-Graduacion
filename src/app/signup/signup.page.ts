import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { FireserviceService } from '../fireservice.service';
import { ToastController } from '@ionic/angular'; 


// Validador personalizado para la fecha
export function dateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    return regex.test(value) ? null : { invalidDate: true };
  };
} 

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})



export class SignupPage {
  signupForm: FormGroup;
  firebaseError: string | null = null;
  passwordsDontMatch: boolean = false;
  email: any;
  password: any;
  name: any;

  constructor(
    public fireService: FireserviceService, 
    private navCtrl: NavController,
    private router: Router,
    private formBuilder: FormBuilder,
    private toastController: ToastController
  ) {
    this.signupForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      birthDate: ['', [Validators.required, dateValidator()]],
    }, 
    { validators: this.matchingPasswords });
  }

  matchingPasswords(group: FormGroup): any {
    let pass = group.controls['password'].value;
    let confirmPass = group.controls['confirmPassword'].value;

    return pass === confirmPass ? null : { notSame: true };
  }

  // Método para mostrar un Toast con mensaje de éxito
async presentToast(message: string) {
  const toast = await this.toastController.create({
    message: message,
    duration: 2000,
    position: 'top',
    color: 'success'
  });
  toast.present();
}

onSubmit() {
  this.firebaseError = null; // Reinicia el mensaje de error
  if (this.signupForm.valid) {
    const { email, password, name, birthDate } = this.signupForm.value; // Asegúrate de incluir 'birthDate'
    const confirmPassword = this.signupForm.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      this.firebaseError = 'Las contraseñas no coinciden.';
      return;
    }

    console.log('Formulario válido, registrando usuario con:', { email, password, name, birthDate }); // Log antes de llamar a signUP

    // Llamar a la función signUP con todos los datos incluyendo birthDate
    this.fireService.signUP({ email, password, name, birthDate })
      .then(async (user) => {
        console.log('Usuario registrado con éxito:', user); // Log después de que el usuario ha sido registrado

        localStorage.setItem('usuario', name);
        localStorage.setItem('uid', user.uid); // Guardar UID en localStorage

        // Mostrar mensaje de éxito
        await this.presentToast('Registro exitoso. Iniciando sesión...');

        // Redirigir al usuario a la página principal
        this.router.navigate(['/tabs/tab1']);
      })
      .catch((error) => {
        console.error('Error durante el registro:', error); // Log si ocurre un error
        this.firebaseError = this.translateFirebaseError(error.code);
      });
  } else {
    console.log('Formulario inválido, mostrando errores'); // Log si el formulario no es válido
    Object.keys(this.signupForm.controls).forEach(key => {
      const control = this.signupForm.get(key);
      if (control) control.markAsTouched();
    });
  }
}

  


  login(){
    
    this.router.navigate(['/login'])

  }

  formatDate(event: any): void {
    let input = event.target.value.replace(/[^0-9]/g, '');
    let formatted = input;
    if (input.length > 2) {
      formatted = `${input.slice(0, 2)}/${input.slice(2)}`;
    }
    if (input.length > 4) {
      formatted = `${input.slice(0, 2)}/${input.slice(2, 4)}/${input.slice(4)}`;
    }
    this.signupForm.get('birthDate')?.setValue(formatted, { emitEvent: false });
  }

  checkPasswords(): void {
    const password = this.signupForm.get('password')?.value;
    const confirmPassword = this.signupForm.get('confirmPassword')?.value;
    this.passwordsDontMatch = password !== confirmPassword;
  }

  translateFirebaseError(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'El correo electrónico ya está en uso.';
      case 'auth/invalid-email':
        return 'El correo electrónico es inválido.';
      // Añade más casos según sea necesario
      default:
        return 'Ha ocurrido un error, intenta de nuevo.';
    }
  }
}



