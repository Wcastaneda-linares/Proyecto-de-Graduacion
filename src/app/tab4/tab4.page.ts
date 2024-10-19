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
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { AngularFireAuth } from '@angular/fire/compat/auth'; 
import { SolicitudesModalComponent } from '../solicitudes-modal/solicitudes-modal.component'; // Importa el modal

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

  @ViewChild('chartRef', { static: false }) chartRef!: ElementRef;
  


  public chartOptions: Partial<ChartOptions> | any = {
    series: [],
    chart: {
      type: 'donut',
      height: 350,
    },
    labels: ['Usuarios', 'Publicaciones', 'Aprobadas', 'Pendientes', 'Rechazadas'],
    legend: {
      position: 'bottom',
    },
    title: {
      text: 'Estadísticas de la Aplicación',
    },
    colors: ['#1E88E5', '#66BB6A', '#FFB74D', '#EF5350', '#7E57C2'],
  };

  selectedSegment = 'user-management';
  usuariosPaginados: any[] = [];
  publicaciones: any[] = [];
  solicitudesAdopcion: any[] = [];
  totalUsuarios: number = 0;
  totalPublicaciones: number = 0;
  totalSolicitudesAprobadas: number = 0;
  totalSolicitudesPendientes: number = 0;
  totalSolicitudesRechazadas: number = 0; // Declara esta nueva propiedad

  


  constructor(
    private fireService: FireserviceService,
    private modalCtrl: ModalController,
    private firestore: AngularFirestore,
    private router: Router,
    private popoverController: PopoverController,
    private alertController: AlertController, // Agregamos AlertController
    private cdr: ChangeDetectorRef,
    private afAuth: AngularFireAuth, // Inyecta AngularFireAuth
  ) {}

  ngOnInit() {
    this.obtenerDatos(); // Primero obtenemos los datos
    this.obtenerPublicacionesConSolicitudes();
  }
  

  ionViewDidEnter() {
    setTimeout(() => {
      this.cdr.detectChanges(); // Forzar la detección de cambios
    }, 300); // Esperamos 300 ms para mayor seguridad
  }

  async verSolicitud(solicitud: any) {
    const modal = await this.modalCtrl.create({
      component: SolicitudesModalComponent,
      componentProps: {
        solicitud: solicitud  // Pasamos la solicitud completa al modal
      }
    });
    return await modal.present();
  }
  

  async obtenerDatos() {
    await Promise.all([
      this.obtenerUsuarios(),
      this.obtenerPublicaciones(),
      this.obtenerSolicitudesAdopcion(),
    ]);
  
    console.log('Usuarios:', this.totalUsuarios);
    console.log('Publicaciones:', this.totalPublicaciones);
    console.log('Solicitudes Aprobadas:', this.totalSolicitudesAprobadas);
    console.log('Solicitudes Pendientes:', this.totalSolicitudesPendientes);
    console.log('Solicitudes Rechazadas:', this.totalSolicitudesRechazadas); // Verificar las rechazadas
  
    // Llama a actualizar el gráfico con los datos cargados
    this.actualizarGrafico();
  }

  actualizarGrafico() {
    if (
      this.totalUsuarios !== null &&
      this.totalPublicaciones !== null &&
      this.totalSolicitudesAprobadas !== null &&
      this.totalSolicitudesPendientes !== null &&
      this.totalSolicitudesRechazadas !== null
    ) {
      this.chartOptions.series = [
        this.totalUsuarios || 0,
        this.totalPublicaciones || 0,
        this.totalSolicitudesAprobadas || 0,
        this.totalSolicitudesPendientes || 0,
        this.totalSolicitudesRechazadas || 0, // Añadir las rechazadas al gráfico
      ];
  
      this.chartOptions.labels = ['Usuarios', 'Publicaciones', 'Aprobadas', 'Pendientes', 'Rechazadas']; // Asegúrate de incluir las etiquetas correctas
  
      console.log('Datos del gráfico:', this.chartOptions.series);
      
      // Forzar la detección de cambios para que el gráfico se actualice
      this.cdr.detectChanges();
    } else {
      console.error('Los datos del gráfico no están listos.');
    }
  }


  configurarGrafico() {
    this.chartOptions = {
      series: [
        {
          name: 'Estadísticas',
          data: [
            this.totalUsuarios || 0,
            this.totalPublicaciones || 0,
            this.totalSolicitudesAprobadas || 0,
            this.totalSolicitudesPendientes || 0,
            this.totalSolicitudesRechazadas || 0,
          ],
        }
      ],
      chart: {
        type: 'bar',  // Asegúrate de que esté configurado en 'bar'
        height: 350
      },
      plotOptions: {
        bar: {
          horizontal: false,  // Cambia a 'true' si prefieres barras horizontales
          columnWidth: '55%',
          endingShape: 'rounded'
        }
      },
      dataLabels: {
        enabled: true
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      xaxis: {
        categories: ['Usuarios', 'Publicaciones', 'Aprobadas', 'Pendientes', 'Rechazadas'], // Etiquetas de las barras
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function (val: number) {
            return val + " solicitudes";
          }
        }
      },
      title: {
        text: 'Estadísticas de la Aplicación',
        align: 'center'
      },
      colors: ['#1976D2', '#66BB6A', '#FFA500', '#EF5350', '#FF6384'],  // Colores para cada barra
      legend: {
        position: 'bottom',
      },
    };
  }
 
  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }

  obtenerUsuarios() {
    return new Promise<void>((resolve) => {
      this.firestore.collection('users').snapshotChanges().subscribe(snapshots => {
        this.usuariosPaginados = snapshots.map(snap => {
          const data = snap.payload.doc.data() as any;
          const id = snap.payload.doc.id;
          return {
            uid: data.uid || id, // Asegúrate de obtener el UID correcto
            name: data.name || 'Sin nombre',
            email: data.email || 'Sin email',
            role: data.role || 'Usuario',
            createdAt: data.createdAt?.toDate() || 'Fecha desconocida'
          };
        });
  
        this.totalUsuarios = this.usuariosPaginados.length;
        console.log('Total de usuarios:', this.totalUsuarios); // Verificar si se está actualizando
        resolve(); // Asegurar que la promesa se resuelve
      });
    });
  }


  // Método para abrir el modal con los datos de la solicitud
async abrirSolicitudModal(solicitud: any) {
  const modal = await this.modalCtrl.create({
    component: SolicitudesModalComponent,
    componentProps: {
      solicitud: solicitud // Pasar los datos de la solicitud al modal
    }
  });

  return await modal.present();
}



  
  obtenerPublicaciones() {
    return new Promise<void>((resolve) => {
      this.firestore.collection('publicaciones').snapshotChanges().subscribe(snapshots => {
        console.log('Snapshots de publicaciones:', snapshots); // Verifica si hay resultados
        this.publicaciones = snapshots.map(snap => {
          const data = snap.payload.doc.data() as any;
          console.log('Datos de publicación:', data); // Verifica los datos
          const id = snap.payload.doc.id;
          const imagenURL = data.imagenURL || 'assets/default-avatar.png'; 
          const tipo = data.mascota?.tipo || 'Desconocido';
          const estadoSalud = data.mascota?.estadoSalud || 'No disponible';
          return {
            id,
            imagenURL,
            mascota: {
              ...data.mascota,
              tipo,
              estadoSalud
            }
          };
        });
    
        this.totalPublicaciones = this.publicaciones.length;
        console.log('Total de publicaciones:', this.totalPublicaciones); // Verificar si se está actualizando
        resolve(); // Asegurar que la promesa se resuelve
      });
    });
  }


// Obtener las publicaciones junto con las solicitudes
obtenerPublicacionesConSolicitudes() {
  this.firestore.collection('publicaciones').snapshotChanges().subscribe(snapshots => {
    this.publicaciones = snapshots.map(snap => {
      const data = snap.payload.doc.data() as any;
      const id = snap.payload.doc.id;
      return {
        id,
        imagenURL: data.imagenURL || 'assets/default-avatar.png',
        mascota: {
          ...data.mascota,
          nombre: data.mascota?.nombre || 'Desconocido'
        },
        solicitudes: [],  // Inicialmente vacía
        mostrarSolicitudes: false // Para controlar la visibilidad de las solicitudes
      };
    });

    // Por cada publicación, obtener sus solicitudes de adopción
    this.publicaciones.forEach(publicacion => {
      this.firestore.collection('solicitudes_adopcion', ref =>
        ref.where('idMascota', '==', publicacion.id)
      ).snapshotChanges().subscribe(solicitudesSnap => {
        publicacion.solicitudes = solicitudesSnap.map(snap => {
          const solicitudData = snap.payload.doc.data() as any;
          return {
            id: snap.payload.doc.id,
            ...solicitudData,
            documentoURL: solicitudData.documentoURL || null // Asegurarse de que el documentoURL esté presente
          };
        });
      });
    });
  });
}

  
    // Toggle para mostrar u ocultar las solicitudes
    toggleSolicitudes(publicacion: any) {
      publicacion.mostrarSolicitudes = !publicacion.mostrarSolicitudes;
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
    return new Promise<void>((resolve) => {
      this.firestore.collection('solicitudes_adopcion').snapshotChanges().subscribe(snapshots => {
        console.log('Snapshots de solicitudes de adopción:', snapshots); // Verifica si hay resultados
        this.solicitudesAdopcion = snapshots.map(snap => {
          const data = snap.payload.doc.data() as any;
          console.log('Datos de solicitud:', data); // Verifica los datos
          const id = snap.payload.doc.id;
          return {
            id,
            ...data,
            estado: data.estado || 'Pendiente',
            fechaCreacion: data.fechaCreacion?.toDate() || 'Fecha desconocida',
            identificacionURL: data.identificacionURL || null, // Asegúrate de obtener la URL del documento
            tiempoRespuesta: data.fechaRespuesta 
              ? this.calcularTiempoRespuesta(data.fechaCreacion, data.fechaRespuesta) 
              : 'En espera'
          };
        });
  
        // Contar solicitudes según su estado
        this.totalSolicitudesAprobadas = this.solicitudesAdopcion.filter(s => s.estado === 'Aprobada').length;
        this.totalSolicitudesPendientes = this.solicitudesAdopcion.filter(s => s.estado === 'Pendiente').length;
        this.totalSolicitudesRechazadas = this.solicitudesAdopcion.filter(s => s.estado === 'Rechazada').length; // Añadimos rechazadas
    
        console.log('Solicitudes Aprobadas:', this.totalSolicitudesAprobadas);
        console.log('Solicitudes Pendientes:', this.totalSolicitudesPendientes);
        console.log('Solicitudes Rechazadas:', this.totalSolicitudesRechazadas); // Verifica que las solicitudes rechazadas se cuenten correctamente
    
        resolve(); // Asegurar que la promesa se resuelve
      });
    });
  }
  
  

  
  calcularTiempoRespuesta(fechaInicio: Date, fechaFin: Date) {
    const diff = fechaFin.getTime() - fechaInicio.getTime();
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${dias} días`;
  }



  exportarReportePDF() {
    const doc = new jsPDF();
  
    // Función para agregar encabezado
    const agregarEncabezado = () => {
      // Estilo del título en azul y negrita
      doc.setFontSize(16);
      doc.setTextColor('#1976D2');  // Color azul
      doc.setFont('helvetica', 'bold');  // Texto en negrita
      doc.text('APLICACIÓN MÓVIL PARA LA ADOPCIÓN RESPONSABLE', 10, 15);  // Título más grande
      doc.line(10, 20, 200, 20);  // Línea debajo del encabezado
    };
  
    // Agregar encabezado en la primera página
    agregarEncabezado();
  
    // Volvemos al estilo normal para el resto del texto
    doc.setTextColor(0, 0, 0);  // Cambia a negro
    doc.setFont('helvetica', 'normal');  // Texto normal
  
    // Contenido del reporte
    doc.setFontSize(14);
    doc.text('Reporte de la Aplicación Móvil', 10, 30);  // Mover el subtítulo más abajo
  
    doc.setFontSize(12);
    doc.text(`Total de Usuarios: ${this.totalUsuarios}`, 10, 50);
    doc.text(`Total de Publicaciones: ${this.totalPublicaciones}`, 10, 60);
    doc.text(`Solicitudes Aprobadas: ${this.totalSolicitudesAprobadas}`, 10, 70);
    doc.text(`Solicitudes Pendientes: ${this.totalSolicitudesPendientes}`, 10, 80);
    doc.text(`Solicitudes Rechazadas: ${this.totalSolicitudesRechazadas}`, 10, 90);
  
    // Capturamos el gráfico como imagen usando html2canvas
    const chartElement = this.chartRef.nativeElement;
    html2canvas(chartElement).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      
      // Ajustar el tamaño y posición de la imagen (aumentando la anchura)
      doc.addImage(imgData, 'PNG', 40, 100, 110, 110);  // Ampliar el gráfico a 190 de ancho y ajustar la posición
  
      // Guardar el PDF
      doc.save('reporte-aplicacion.pdf');
    }).catch((error) => {
      console.error('Error al generar la imagen del gráfico:', error);
    });
  }
  
  exportarReporteExcel() {
    // Crear un libro de trabajo
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
  
    // Datos del reporte
    const data = [
      ['APLICACIÓN MÓVIL PARA LA ADOPCIÓN RESPONSABLE'],
      [],  // Fila vacía para espacio
      ['Reporte de la Aplicación Móvil'],  // Título
      [],  // Fila vacía para espacio
      ['Total de Usuarios', this.totalUsuarios],
      ['Total de Publicaciones', this.totalPublicaciones],
      ['Solicitudes Aprobadas', this.totalSolicitudesAprobadas],
      ['Solicitudes Pendientes', this.totalSolicitudesPendientes],
      ['Solicitudes Rechazadas', this.totalSolicitudesRechazadas]
    ];
  
    // Convertir los datos a una hoja de trabajo
    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
  
    // Agregar la hoja de trabajo al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');
  
    // Exportar el archivo Excel
    XLSX.writeFile(workbook, 'reporte-aplicacion.xlsx');
  }
  
 
  imprimirReporte() {
    const printContents = document.getElementById('printable-report');
    
    if (printContents) {
      html2canvas(printContents).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        
        // Crear una ventana emergente para la impresión
        const popupWin = window.open('', '_blank', 'width=800,height=600');
        
        popupWin?.document.open();
        popupWin?.document.write(`
          <html>
            <head>
              <title>Reporte de la Aplicación Móvil</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 10px;
                  padding: 10px;
                  text-align: center;
                  transform: scale(0.9); /* Reducir ligeramente la escala */
                  transform-origin: top center; /* Asegurar que esté centrado */
                }
                h1 {
                  color: #1976D2;
                  font-size: 28px; /* Aumentar tamaño del título */
                  text-align: center; /* Asegurar que el título esté centrado */
                }
                img {
                  width: 80%; /* Ampliar el tamaño de la imagen */
                  height: auto;
                  margin: 0 auto; /* Centrar la imagen */
                  display: block;
                }
                .info-box {
                  margin: 5px 0;
                  padding: 5px;
                  border: 1px solid #ddd;
                  font-size: 14px; /* Aumentar el tamaño del texto */
                  text-align: center; /* Asegurar que el contenido esté centrado */
                }
                @media print {
                  body, ion-card, ion-item, .info-box {
                    page-break-inside: avoid;
                    margin: 0;
                    padding: 0;
                  }
                  img {
                    max-width: 100%;
                    height: auto;
                  }
                  /* Ocultar los botones de impresión */
                  ion-button {
                    display: none;
                  }
                }
              </style>
            </head>
            <body>
              <h1>APLICACIÓN MÓVIL PARA LA ADOPCIÓN RESPONSABLE</h1>
              <img src="${imgData}" />
              <script>
                window.onload = function() {
                  window.print();
                  window.onafterprint = window.close;
                };
              </script>
            </body>
          </html>
        `);
        
        popupWin?.document.close();
      }).catch((error) => {
        console.error('Error al capturar el área de impresión:', error);
      });
    } else {
      console.error('No se encontró el área de impresión.');
    }
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




  async openUpdateModal(publicacion: any) {
    // Clona la publicación para evitar problemas de referencia.
    const publicacionClone = JSON.parse(JSON.stringify(publicacion));
  
    // Asegúrate de que los datos del donante estén completos antes de abrir el modal.
    if (!publicacionClone.donante) {
      publicacionClone.donante = {
        nombre: '',
        direccion: '',
        numeroContacto: ''
      };
    }
  
    const modal = await this.modalCtrl.create({
      component: UpdatePublicacionModalComponent,
      componentProps: { publicacion: publicacionClone },
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
      // Aquí se actualiza solo la información de la mascota en la publicación
      await this.firestore.collection('publicaciones').doc(id).update({
        mascota: data.mascota
      });
      this.obtenerPublicaciones(); // Refresca la lista de publicaciones
    } catch (error) {
      console.error('Error al actualizar la información de la mascota:', error);
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

  async eliminarUsuario(usuario: any) {
    console.log('Datos del usuario antes de eliminar:', usuario); // Verifica los datos del usuario
    
    if (usuario?.uid) {
      try {
        // Intentar eliminar primero en Firestore
        await this.firestore.collection('users').doc(usuario.uid).delete();
        console.log(`Usuario ${usuario.name} eliminado exitosamente de Firestore.`);
        
        // Eliminar al usuario actual de Firebase Authentication (si está autenticado)
        const currentUser = await this.afAuth.currentUser;
        if (currentUser && currentUser.uid === usuario.uid) {
          await currentUser.delete();
          console.log(`Usuario ${usuario.name} eliminado exitosamente de Firebase Authentication.`);
        } else {
          console.log('El usuario no está autenticado o no coincide con el usuario actual.');
        }

        this.obtenerUsuarios(); // Refrescar la lista de usuarios
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
      }
    } else {
      console.error('ID de usuario no válido.');
    }
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
