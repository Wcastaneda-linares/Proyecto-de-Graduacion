import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { FireserviceService } from '../fireservice.service';
import { EditUserModalComponent } from '../edit-user-modal/edit-user-modal.component'; // Importa el componente aquí

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {
  usuarios: any[] = [];
  usuariosPaginados: any[] = [];
  paginaActual: number = 1;
  elementosPorPagina: number = 5;
  totalPaginas: number = 1;
  selectedSegment: string = 'user-management';

  constructor(
    private fireService: FireserviceService,
    private router: Router,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.obtenerUsuarios();
  }

  

  obtenerUsuarios() {
    this.fireService.getUsersWithLastSignIn().subscribe(
      (data: any[]) => {
        this.usuarios = data;
        this.totalPaginas = Math.ceil(this.usuarios.length / this.elementosPorPagina);
        this.actualizarUsuariosPaginados();
      },
      (error: any) => {
        console.error('Error obteniendo usuarios:', error);
      }
    );
  }

  actualizarUsuariosPaginados() {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    this.usuariosPaginados = this.usuarios.slice(inicio, fin);
  }

  cambiarPagina(pagina: number) {
    this.paginaActual = pagina;
    this.actualizarUsuariosPaginados();
  }

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }

  async editarUsuario(usuario: any) {
    const modal = await this.modalCtrl.create({
      component: EditUserModalComponent,
      componentProps: { usuario }  // Pasar el usuario al modal
    });
  
    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.obtenerUsuarios(); // Actualiza la lista de usuarios si es necesario
      }
    });
  
    return await modal.present();
  }
  
  

  logout() {
    this.fireService.logout().then(() => {
      this.router.navigate(['/login']);
    }).catch((error: any) => {
      console.error('Error al cerrar sesión', error);
    });
  }
}
