import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router, NavigationEnd } from '@angular/router'; // Importa Router y NavigationEnd
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
})
export class TabsPage implements OnInit {
  contadorNotificaciones: number = 0; // Contador de notificaciones no leídas

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router,
    private cd: ChangeDetectorRef // Cambios detectados
  ) {}

  ngOnInit() {
    this.obtenerNotificaciones();

    // Escuchar cambios en la navegación para detectar cuándo se abre el perfil (tab3)
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url === '/tabs/tab3') {
          this.obtenerNotificaciones(); // Actualiza notificaciones
        }
      });
  }

  obtenerNotificaciones() {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.firestore
          .collection('users')
          .doc(user.uid)
          .valueChanges()
          .subscribe((usuario: any) => {
            if (usuario && usuario.notificaciones) {
              // Filtrar las notificaciones no leídas
              this.contadorNotificaciones = usuario.notificaciones.filter(
                (notificacion: any) => !notificacion.leida
              ).length;

              // Forzamos la detección de cambios para reflejar el contador
              this.cd.detectChanges();
            }
          });
      }
    });
  }

  logout() {
    this.router.navigateByUrl('/login'); // Redirige al usuario a la pantalla de inicio de sesión
  }
}
