import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { Tab4PageRoutingModule } from './tab4-routing.module';
import { Tab4Page } from './tab4.page';
import { EditUserModalComponent } from '../edit-user-modal/edit-user-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    Tab4PageRoutingModule
  ],
  declarations: [
    Tab4Page,
    EditUserModalComponent
  ]
})
export class Tab4PageModule {}  // Asegúrate de que este nombre es correcto y coincide con el utilizado en las rutas
