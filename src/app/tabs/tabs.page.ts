import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(private router: Router) {}

  logout() {
    // Aquí iría tu lógica para cerrar sesión, por ejemplo:
    // this.authService.logout();
    this.router.navigateByUrl('/login'); // Redirige al usuario a la pantalla de inicio de sesión
  }

}

