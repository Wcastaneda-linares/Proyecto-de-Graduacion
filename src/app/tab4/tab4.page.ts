import { ModalController, PopoverController, AlertController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FireserviceService } from '../fireservice.service';
import firebase from 'firebase/compat/app';
import { Router } from '@angular/router';
import { UpdatePublicacionModalComponent } from '../update-publicacion-modal/update-publicacion-modal.component'; 
import { PopoverComponent } from '../popover/popover.component';
import { jsPDF } from 'jspdf';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import {
  ApexNonAxisChartSeries,
  ApexChart,
  ApexTitleSubtitle,
  ApexLegend,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  title: ApexTitleSubtitle;
  labels: string[];
  legend: ApexLegend;
};


@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {
  public chartOptions: Partial<ChartOptions> | any;
  selectedSegment = 'user-management';
  usuariosPaginados: any[] = [];
  publicaciones: any[] = [];
  solicitudesAdopcion: any[] = [];
  totalUsuarios: number = 0;
  totalPublicaciones: number = 0;
  totalSolicitudesAprobadas: number = 0;
  totalSolicitudesPendientes: number = 0;

  


  constructor(
    private fireService: FireserviceService,
    private modalCtrl: ModalController,
    private firestore: AngularFirestore,
    private router: Router,
    private popoverController: PopoverController,
    private alertController: AlertController, // Agregamos AlertController
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.obtenerDatos();
    this.configurarGrafico(); // Configura y renderiza el gráfico
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.cdr.detectChanges(); // Forzar la detección de cambios
    }, 300); // Esperamos 300 ms para mayor seguridad
  }


  
  async obtenerDatos() {
    await Promise.all([
      this.obtenerUsuarios(),
      this.obtenerPublicaciones(),
      this.obtenerSolicitudesAdopcion(),
    ]);
  
    console.log('Datos cargados:', this.totalUsuarios, this.totalPublicaciones);
    console.log('Datos del gráfico:', [
      this.totalUsuarios,
      this.totalPublicaciones,
      this.totalSolicitudesAprobadas,
      this.totalSolicitudesPendientes,
    ]);
  
    // Configura el gráfico después de cargar los datos
    this.configurarGrafico();
  }
  
  
  actualizarGrafico() {
    // Aseguramos que los datos sean válidos antes de renderizar
    this.chartOptions.series = [
      this.totalUsuarios || 0,
      this.totalPublicaciones || 0,
      this.totalSolicitudesAprobadas || 0,
      this.totalSolicitudesPendientes || 0,
    ];
  
    console.log('Datos del gráfico:', this.chartOptions.series);
  }
  
  

  configurarGrafico() {
    this.chartOptions = {
      series: [],
      chart: {
        type: 'donut',
        height: 350,
      },
      labels: ['Usuarios', 'Publicaciones', 'Aprobadas', 'Pendientes'],
      legend: {
        position: 'bottom',
      },
      title: {
        text: 'Estadísticas de la Aplicación',
      },
      colors: ['#42A5F5', '#66BB6A', '#FFA726', '#EF5350'],
    };
  }
  
  


  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }

  obtenerUsuarios() {
    this.firestore.collection('users').snapshotChanges().subscribe(snapshots => {
      this.usuariosPaginados = snapshots.map(snap => {
        const data = snap.payload.doc.data() as any;
        const id = snap.payload.doc.id;
        return {
          id,
          name: data.name || 'Sin nombre',
          email: data.email || 'Sin email',
          role: data.role || 'Usuario',
          createdAt: data.createdAt?.toDate() || 'Fecha desconocida'
        };
      });
  
      this.totalUsuarios = this.usuariosPaginados.length;
      console.log('Total de usuarios:', this.totalUsuarios); // Verificar si se está actualizando
    });
  }
  
  

  obtenerPublicaciones() {
    this.firestore.collection('publicaciones').snapshotChanges().subscribe(snapshots => {
      this.publicaciones = snapshots.map(snap => {
        const data = snap.payload.doc.data() as any;
        const id = snap.payload.doc.id;
        const tipo = data.mascota?.tipo || 'Desconocido';
        const estadoSalud = data.mascota?.estadoSalud || 'No disponible';
        return {
          id,
          mascota: {
            ...data.mascota,
            tipo,
            estadoSalud
          }
        };
      });
  
      this.totalPublicaciones = this.publicaciones.length;
      this.calcularEstadisticasPublicaciones();
    });
  }
  
  calcularEstadisticasPublicaciones() {
    const tipos = this.publicaciones.map(p => p.mascota.tipo);
    const tiposUnicos = [...new Set(tipos)];
  
    tiposUnicos.forEach(tipo => {
      const count = tipos.filter(t => t === tipo).length;
      console.log(`Total de ${tipo}: ${count}`);
    });
  }
  

  obtenerSolicitudesAdopcion() {
    this.firestore.collection('solicitudes_adopcion').snapshotChanges().subscribe(snapshots => {
      this.solicitudesAdopcion = snapshots.map(snap => {
        const data = snap.payload.doc.data() as any;
        const id = snap.payload.doc.id;
        return {
          id,
          ...data,
          estado: data.estado || 'Pendiente',
          fechaCreacion: data.fechaCreacion?.toDate() || 'Fecha desconocida',
          tiempoRespuesta: data.fechaRespuesta 
            ? this.calcularTiempoRespuesta(data.fechaCreacion, data.fechaRespuesta) 
            : 'En espera'
        };
      });
  
      this.totalSolicitudesAprobadas = this.solicitudesAdopcion.filter(s => s.estado === 'Aprobada').length;
      this.totalSolicitudesPendientes = this.solicitudesAdopcion.filter(s => s.estado === 'Pendiente').length;
    });
  }
  
  calcularTiempoRespuesta(fechaInicio: Date, fechaFin: Date) {
    const diff = fechaFin.getTime() - fechaInicio.getTime();
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${dias} días`;
  }
  
  

  exportarReportePDF() {
    const doc = new jsPDF();
  
    doc.setFontSize(18);
    doc.text('Reporte de la Aplicación', 10, 10);
  
    doc.setFontSize(14);
    doc.text(`Total de Usuarios: ${this.totalUsuarios}`, 10, 30);
    doc.text(`Total de Publicaciones: ${this.totalPublicaciones}`, 10, 40);
    doc.text(`Solicitudes Aprobadas: ${this.totalSolicitudesAprobadas}`, 10, 50);
    doc.text(`Solicitudes Pendientes: ${this.totalSolicitudesPendientes}`, 10, 60);
  
    doc.text('Estadísticas por Tipo de Mascota:', 10, 80);
    const tipos = [...new Set(this.publicaciones.map(p => p.mascota.tipo))];
    tipos.forEach((tipo, index) => {
      const count = this.publicaciones.filter(p => p.mascota.tipo === tipo).length;
      doc.text(`${tipo}: ${count}`, 10, 90 + (index * 10));
    });
  
    doc.save('reporte-aplicacion.pdf');
  }
  



  async presentPopover(ev: Event) {
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: ev,
      translucent: true,
    });
    await popover.present();
    const { data } = await popover.onWillDismiss();
    if (data) {
      this.selectedSegment = data;
    }
  }

  selectSegment(segment: string) {
    this.selectedSegment = segment;
    this.popoverController.dismiss();
  }

  async eliminarPublicacion(publicacion: any) {
    const alert = await this.alertController.create({
      header: 'Eliminar Publicación',
      message: '¿Estás seguro de que deseas eliminar esta publicación?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.firestore.collection('publicaciones').doc(publicacion.id).delete().then(() => {
              this.obtenerPublicaciones();
            });
          },
        },
      ],
    });
    await alert.present();
  }


  enviarNotificacion(userId: string, mensaje: string) {
    const notificacion = {
      mensaje,
      fecha: new Date().toISOString(),
      leida: false,
    };

    this.firestore.collection('users').doc(userId).update({
      notificaciones: firebase.firestore.FieldValue.arrayUnion(notificacion),
    }).then(() => {
      console.log('Notificación enviada con éxito');
    }).catch(error => {
      console.error('Error al enviar notificación: ', error);
    });
  }

  async openUpdateModal(publicacion: any) {
    const modal = await this.modalCtrl.create({
      component: UpdatePublicacionModalComponent,
      componentProps: { publicacion: JSON.parse(JSON.stringify(publicacion)) },
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.actualizarPublicacion(publicacion.id, result.data);
      }
    });

    return await modal.present();
  }

  async actualizarPublicacion(id: string, data: any) {
    try {
      await this.firestore.collection('publicaciones').doc(id).update(data);
      this.obtenerPublicaciones();
    } catch (error) {
      console.error('Error al actualizar la publicación:', error);
    }
  }



  async presentRoleChangeOptions(usuario: any) {
    const alert = await this.alertController.create({
      header: 'Cambiar de Rol',
      message: `Seleccione el nuevo rol para ${usuario.name}`,
      inputs: [
        {
          name: 'role',
          type: 'radio',
          label: 'Administrador',
          value: 'admin',
          checked: usuario.role === 'admin',
        },
        {
          name: 'role',
          type: 'radio',
          label: 'Usuario',
          value: 'user',
          checked: usuario.role === 'user',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Cambiar',
          handler: (nuevoRol) => {
            this.confirmarCambioRol(usuario, nuevoRol);
          },
        },
      ],
    });
  
    await alert.present();
  }



  // Confirmar eliminación del usuario
  async confirmarEliminacionUsuario(usuario: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que deseas eliminar al usuario "${usuario.name}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.eliminarUsuario(usuario); // Llamar al método de eliminación
          },
        },
      ],
    });

    await alert.present();
  }

  // Lógica para eliminar usuario
  eliminarUsuario(usuario: any) {
    if (usuario?.uid) {
      this.firestore
        .collection('users')
        .doc(usuario.uid)
        .delete()
        .then(() => {
          console.log(`Usuario ${usuario.name} eliminado exitosamente.`);
          this.obtenerUsuarios(); // Refrescar la lista de usuarios
        })
        .catch((error) => {
          console.error('Error al eliminar usuario:', error);
        });
    } else {
      console.error('ID de usuario no válido.');
    }
  }

  

  async aprobarSolicitud(solicitud: any) {
    const alert = await this.alertController.create({
      header: 'Aprobar Solicitud',
      message: '¿Estás seguro de que deseas aprobar esta solicitud?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Aprobar',
          handler: () => {
            this.firestore.collection('solicitudes_adopcion').doc(solicitud.id).update({ estado: 'Aprobada' })
              .then(() => {
                this.enviarNotificacion(solicitud.idUsuarioSolicitante, 'Tu solicitud de adopción ha sido aprobada.');
                this.removerSolicitud(solicitud.id);
              });
          },
        },
      ],
    });
    await alert.present();
  }
  
  async rechazarSolicitud(solicitud: any) {
    const alert = await this.alertController.create({
      header: 'Rechazar Solicitud',
      message: '¿Estás seguro de que deseas rechazar esta solicitud?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Rechazar',
          handler: () => {
            this.firestore.collection('solicitudes_adopcion').doc(solicitud.id).update({ estado: 'Rechazada' })
              .then(() => {
                this.enviarNotificacion(solicitud.idUsuarioSolicitante, 'Tu solicitud de adopción ha sido rechazada.');
                this.removerSolicitud(solicitud.id);
              });
          },
        },
      ],
    });
    await alert.present();
  }
  
  removerSolicitud(id: string) {
    this.solicitudesAdopcion = this.solicitudesAdopcion.filter(solicitud => solicitud.id !== id);
  }
  

  async cambiarRolUsuario(usuario: any, nuevoRol: string) {
    if (!usuario || !usuario.uid) {
      console.error('El ID del usuario no es válido.');
      return; // Detener la ejecución si no hay un UID válido.
    }
  
    if (usuario.role === nuevoRol) {
      console.log(`El rol del usuario ${usuario.name} ya es ${nuevoRol}.`);
      return; // Detener si el rol no ha cambiado.
    }
  
    try {
      // Actualizar el rol en Firestore.
      await this.firestore.collection('users').doc(usuario.uid).update({ role: nuevoRol });
      console.log(`Rol del usuario ${usuario.name} cambiado a ${nuevoRol}.`);
  
      // Refrescar la lista de usuarios.
      this.obtenerUsuarios();
    } catch (error) {
      console.error('Error al cambiar el rol del usuario:', error);
    }
  }

  async mostrarSelectorRol(usuario: any) {
    if (!usuario || !usuario.uid) {
      console.error('El ID del usuario no es válido.');
      return;
    }
  
    const alert = await this.alertController.create({
      header: 'Cambiar Rol',
      inputs: [
        {
          name: 'role',
          type: 'radio',
          label: 'Administrador',
          value: 'admin',
          checked: usuario.role === 'admin', // Marcar si ya tiene este rol
        },
        {
          name: 'role',
          type: 'radio',
          label: 'Usuario',
          value: 'user',
          checked: usuario.role === 'user', // Marcar si ya tiene este rol
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cambio de rol cancelado');
          },
        },
        {
          text: 'Aceptar',
          handler: (nuevoRol) => {
            if (nuevoRol !== usuario.role) {
              this.confirmarCambioRol(usuario, nuevoRol);
            } else {
              console.log('El rol seleccionado es el mismo que ya tiene.');
            }
          },
        },
      ],
    });
  
    await alert.present();
  }
  
  async confirmarCambioRol(usuario: any, nuevoRol: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar Cambio de Rol',
      message: `¿Estás seguro de que deseas cambiar el rol de ${usuario.name} a ${nuevoRol}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cambio de rol cancelado.');
          },
        },
        {
          text: 'Aceptar',
          handler: async () => {
            try {
              await this.firestore.collection('users').doc(usuario.uid).update({ role: nuevoRol });
              console.log(`Rol de ${usuario.name} cambiado a ${nuevoRol}.`);
              this.obtenerUsuarios(); // Refrescar lista de usuarios
            } catch (error) {
              console.error('Error al cambiar el rol del usuario:', error);
            }
          },
        },
      ],
    });
  
    await alert.present();
  }
  
 
  logout() {
    this.fireService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }
}
