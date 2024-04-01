import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router'; // Asegúrate de importar Routes también
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AngularFireAuthModule } from '@angular/fire/compat/auth'; // Importa AngularFireAuthModule
import { AlertController } from '@ionic/angular';
import { LoginPage } from './login.page';

// Define las rutas para el módulo LoginPageModule
const routes: Routes = [
  {
    path: '',
    component: LoginPage 
  }
];

@NgModule({
  declarations: [LoginPage],
  providers: [], 
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AngularFireAuthModule, // Agrega AngularFireAuthModule aquí
    RouterModule.forChild(routes) 
  ]
})
export class LoginPageModule {}
