import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
 import { FireserviceService } from '../fireservice.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  public email: any;
  public password: any;

  constructor(
    private navCtrl: NavController,
     public fireService: FireserviceService 
  ) {}

  ngOnInit() {}

  onSubmit() {
    this.fireService.login({ email: this.email, password: this.password })
      .then((userCredential: any) => { // Aquí se espera un UserCredential
        // Manejo del inicio de sesión exitoso
        this.navCtrl.navigateForward('/tabs/tab1');
      })
      .catch((error: any) => { // Manejo de errores
        alert(error.message); // Mostrar mensaje de error
        console.error(error); // Imprimir el error en la consola para depuración
      });
  }
  

  registro() {
    this.navCtrl.navigateForward('/signup');
    console.log('Funciona');
  } 
}
