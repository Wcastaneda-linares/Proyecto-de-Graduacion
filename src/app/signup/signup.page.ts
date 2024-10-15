import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { FireserviceService } from '../fireservice.service';


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
    private formBuilder: FormBuilder
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

  onSubmit() {
    this.firebaseError = null; // Reinicia el mensaje de error
    if (this.signupForm.valid) {
      const { email, password, name, birthDate } = this.signupForm.value;
      const confirmPassword = this.signupForm.get('confirmPassword')?.value;
  
      if (password !== confirmPassword) {
        this.firebaseError = 'Las contraseñas no coinciden.';
        return;
      }
  
      this.fireService.signUP({ email, password })
        .then((res) => {
          if (res && res.user) {
            const data = { email, name, uid: res.user.uid, birthDate };
            this.fireService.saveDetails(data)
              .then(() => {
                localStorage.setItem('usuario', name); // Guarda el nombre en localStorage
                this.router.navigate(['/tabs/tab1']);
              })
              .catch((error) => {
                console.error('Error al guardar los detalles del usuario:', error);
                this.firebaseError = 'Error al guardar tus detalles. Intenta nuevamente.';
              });
          }
        })
        .catch((error) => {
          console.error('Error durante el registro:', error);
          this.firebaseError = this.translateFirebaseError(error.code);
        });
    } else {
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



