import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PopoverComponent } from '../popover/popover.component';
import { Tab4PageRoutingModule } from './tab4-routing.module';
import { Tab4Page } from './tab4.page';
import { UpdatePublicacionModalModule } from '../update-publicacion-modal/update-publicacion-modal.module';  // Importa el módulo del modal
import { NgApexchartsModule } from 'ng-apexcharts';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Tab4PageRoutingModule,
    NgApexchartsModule,
    UpdatePublicacionModalModule  // Usa el módulo del modal aquí
  ],
  declarations: [Tab4Page, PopoverComponent],
})
export class Tab4PageModule {}
