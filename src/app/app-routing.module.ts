import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { ChatPageModule } from './chat/chat.module'; // Asegúrate de que la ruta y el nombre del módulo sean correctos
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'; // Asegúrate de que Capacitor Camera esté instalado correctamente


const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',

  },
  {
    path: '',
    loadChildren: () =>
      import('./tabs/tabs.module').then((m) => m.TabsPageModule),
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'signup',
    loadChildren: () =>
      import('./signup/signup.module').then((m) => m.SignupPageModule),
  },
  {
    path: 'llenar-informacion',
    loadChildren: () =>
      import('./llenar-informacion/llenar-informacion.module').then(
        (m) => m.LlenarInformacionPageModule
      ),
  },
  {
    path: 'informacion-modal',
    loadChildren: () => import('./informacion-modal/informacion-modal.module').then( m => m.InformacionModalPageModule)
  },
  {
    path: 'image-viewer-modal',
    loadChildren: () => import('./image-viewer-modal/image-viewer-modal.module').then( m => m.ImageViewerModalPageModule)
  },
  {
    path: 'chat',
    loadChildren: () => import('./chat/chat.module').then( m => m.ChatPageModule)
  },
  {
    path: 'user-service',
    loadChildren: () => import('./user-service/user-service.module').then( m => m.UserServicePageModule)
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
