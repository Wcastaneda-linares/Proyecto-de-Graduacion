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
import 'jspdf-autotable';
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
      type: 'pie', // Puedes cambiar a 'bar', 'donut', etc. según lo necesites
      height: 350,
    },
    labels: [],
    legend: {
      position: 'bottom',
    },
    title: {
      text: 'Estadísticas de la Aplicación',
      align: 'center'
    },
    colors: ['#1E88E5', '#66BB6A', '#FFA726', '#FF7043', '#AB47BC'],
  };
  
  actualizarGrafico() {
    this.chartOptions = {
      series: [
        this.totalUsuarios || 0,
        this.totalPublicaciones || 0,
        this.totalCentrosAdopcion || 0,
        this.totalMensajes || 0,
        this.totalSolicitudesAdopcion || 0
      ],
      chart: {
        type: 'pie',
        height: 350
      },
      labels: ['Usuarios', 'Publicaciones', 'Centros', 'Mensajes', 'Solicitudes']
    };
    
  }
  

  selectedSegment = 'user-management';
  usuariosPaginados: any[] = [];
  publicaciones: any[] = [];
  solicitudesAdopcion: any[] = [];
  totalUsuarios: number = 0;
  totalPublicaciones: number = 0;
  totalSolicitudesAprobadas: number = 0;
  totalSolicitudesPendientes: number = 0;
  totalSolicitudesRechazadas: number = 0; // Declara esta nueva propiedad
  searchQuery: string = ''; // Agrega una variable para almacenar la consulta de búsqueda
  usuariosPaginadosOriginal: any[] = []; // Lista completa de usuarios
  totalCentrosAdopcion: number = 0;
  totalMensajes: number = 0;
  totalSolicitudesAdopcion: number = 0;
  

  


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
    this.obtenerTotales();
    this.actualizarGrafico();
    this.configurarGrafico();
    this.obtenerTotales().then(() => {
      this.configurarGrafico(); // Configura el gráfico después de obtener los totales
    });
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
  

  async obtenerTotales() {
    try {
      const centrosSnapshot = await this.firestore.collection('centros_adopcion').get().toPromise();
      if (centrosSnapshot) {
        this.totalCentrosAdopcion = centrosSnapshot.size;
      } else {
        console.warn("No se encontraron centros de adopción.");
      }
  
      const mensajesSnapshot = await this.firestore.collection('mensajes').get().toPromise();
      if (mensajesSnapshot) {
        this.totalMensajes = mensajesSnapshot.size;
      } else {
        console.warn("No se encontraron mensajes.");
      }
  
      const publicacionesSnapshot = await this.firestore.collection('publicaciones').get().toPromise();
      if (publicacionesSnapshot) {
        this.totalPublicaciones = publicacionesSnapshot.size;
      } else {
        console.warn("No se encontraron publicaciones.");
      }
  
      const solicitudesSnapshot = await this.firestore.collection('solicitudes_adopcion').get().toPromise();
      if (solicitudesSnapshot) {
        this.totalSolicitudesAdopcion = solicitudesSnapshot.size;
      } else {
        console.warn("No se encontraron solicitudes de adopción.");
      }
  
      const usuariosSnapshot = await this.firestore.collection('users').get().toPromise();
      if (usuariosSnapshot) {
        this.totalUsuarios = usuariosSnapshot.size;
      } else {
        console.warn("No se encontraron usuarios.");
      }
  
      console.log(`Totales: 
        Centros de Adopción: ${this.totalCentrosAdopcion}, 
        Mensajes: ${this.totalMensajes}, 
        Publicaciones: ${this.totalPublicaciones}, 
        Solicitudes de Adopción: ${this.totalSolicitudesAdopcion}, 
        Usuarios: ${this.totalUsuarios}`
      );
    } catch (error) {
      console.error("Error al obtener los totales de las colecciones: ", error);
    }
  }
  

  async obtenerDatos() {
    await Promise.all([
      this.obtenerUsuarios(),
      this.obtenerPublicaciones(),
      this.obtenerCentrosAdopcion(),
      this.obtenerMensajes(),
      this.obtenerSolicitudesAdopcion(),
    ]);
  
    console.log('Usuarios:', this.totalUsuarios);
    console.log('Publicaciones:', this.totalPublicaciones);
    console.log('Centros de Adopción:', this.totalCentrosAdopcion);
    console.log('Mensajes:', this.totalMensajes);
    console.log('Solicitudes de Adopción:', this.totalSolicitudesAdopcion);
  
    // Llama a actualizar el gráfico con los datos cargados
    this.actualizarGrafico();
  }

  async obtenerCentrosAdopcion() {
    return new Promise<void>((resolve) => {
      this.firestore.collection('centros_adopcion').snapshotChanges().subscribe(snapshots => {
        this.totalCentrosAdopcion = snapshots.length;
        resolve();
      });
    });
  }
  
  async obtenerMensajes() {
    return new Promise<void>((resolve) => {
      this.firestore.collection('mensajes').snapshotChanges().subscribe(snapshots => {
        this.totalMensajes = snapshots.length;
        resolve();
      });
    });
  }

  configurarGrafico() {
    // Configurar opciones para el gráfico de barras
    this.chartOptions = {
      series: [{
        name: 'Cantidad',
        data: [
          this.totalUsuarios || 0,
          this.totalPublicaciones || 0,
          this.totalCentrosAdopcion || 0,
          this.totalMensajes || 0,
          this.totalSolicitudesAdopcion || 0
        ]
      }],
      chart: {
        type: 'bar', // Cambiar tipo a 'bar' para un gráfico de barras
        height: 350
      },
      plotOptions: {
        bar: {
          horizontal: false, // Barras verticales
          columnWidth: '55%',
          endingShape: 'rounded'
        }
      },
      dataLabels: {
        enabled: true // Mostrar etiquetas en las barras
      },
      xaxis: {
        categories: [
          'Usuarios', 
          'Publicaciones', 
          'Centros de Adopción', 
          'Mensajes', 
          'Solicitudes de Adopción'
        ] // Etiquetas para el eje X
      },
      colors: ['#1976D2', '#66BB6A', '#FFA500', '#EF5350', '#FF6384'],
      title: {
        text: 'Estadísticas de la Aplicación',
        align: 'center'
      },
      legend: {
        position: 'bottom'
      }
    };
  }
  
 
  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }

  async obtenerUsuarios() {
    return new Promise<void>((resolve) => {
      this.firestore.collection('users').snapshotChanges().subscribe(snapshots => {
        this.usuariosPaginadosOriginal = snapshots.map(snap => {
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
        
        // Inicializa usuariosPaginados con todos los usuarios cargados inicialmente
        this.usuariosPaginados = [...this.usuariosPaginadosOriginal];

        this.totalUsuarios = this.usuariosPaginados.length;
        console.log('Total de usuarios:', this.totalUsuarios); // Verificar si se está actualizando
        resolve(); // Asegurar que la promesa se resuelve
      });
    });
  }

  // Método para filtrar usuarios por nombre
  filtrarUsuarios() {
    const query = this.searchQuery.trim().toLowerCase();
    if (query === '') {
      // Si no hay texto de búsqueda, muestra todos los usuarios
      this.usuariosPaginados = [...this.usuariosPaginadosOriginal];
    } else {
      // Filtra los usuarios que coincidan con la búsqueda
      this.usuariosPaginados = this.usuariosPaginadosOriginal.filter(usuario =>
        usuario.name.toLowerCase().includes(query)
      );
    }
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
        mostrarSolicitudes: false, // Para controlar la visibilidad de las solicitudes
        solicitudesPendientes: 0 // Nueva propiedad para el conteo de pendientes
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

        // Contar las solicitudes pendientes para esta publicación
        publicacion.solicitudesPendientes = publicacion.solicitudes.filter((s: any) => s.estado === 'Pendiente').length;
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


  exportarReportePDF() {
    const doc = new jsPDF();
  
    // Función para agregar encabezado
    const agregarEncabezado = () => {
      doc.setFontSize(16);
      doc.setTextColor('#1976D2'); // Color azul para el título
      doc.setFont('helvetica', 'bold');
      doc.text('APLICACIÓN MÓVIL PARA LA ADOPCIÓN RESPONSABLE', 10, 15);
      doc.line(10, 20, 200, 20);
    };
  
    agregarEncabezado();
  
    // Texto general del reporte
    doc.setTextColor(0, 0, 0); // Color negro para el texto principal
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de la Aplicación Móvil', 10, 30);
  
    // Función para agregar datos en negrita y colores
    const agregarDato = (texto: string, valor: any, y: number) => {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 138, 217); // Negro para el texto principal
      doc.text(`${texto}:`, 10, y);
  
      doc.setTextColor(255, 0, 0); // Rojo para los valores
      doc.text(`${valor}`, 80, y); // Posicionando los valores a la derecha de los textos
    };
  
    // Agregar los datos con sus respectivos valores
    let startY = 50;
    agregarDato('Total de Centros de Adopción', this.totalCentrosAdopcion, startY);
    agregarDato('Total de Mensajes', this.totalMensajes, startY + 10);
    agregarDato('Total de Publicaciones', this.totalPublicaciones, startY + 20);
    agregarDato('Total de Solicitudes de Adopción', this.totalSolicitudesAdopcion, startY + 30);
    agregarDato('Total de Usuarios', this.totalUsuarios, startY + 40);
  
    // Capturamos el gráfico como imagen usando html2canvas
    const chartElement = this.chartRef.nativeElement;
    html2canvas(chartElement).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 140; // Ajustar el ancho para ocupar un 80% del ancho de la hoja
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Mantener la proporción de la imagen
      const imgX = (doc.internal.pageSize.width - imgWidth) / 2; // Calcular la posición X para centrar la imagen
      doc.addImage(imgData, 'PNG', imgX, startY + 60, imgWidth, imgHeight); // Insertar la imagen debajo de los datos, centrada
      doc.save('reporte-aplicacion.pdf');
    }).catch((error) => {
      console.error('Error al generar la imagen del gráfico:', error);
    });
  }
  
  
  
  



  exportarReporteExcel() {
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
  
    const data = [
      ['APLICACIÓN MÓVIL PARA LA ADOPCIÓN RESPONSABLE'],
      [],
      ['Reporte de la Aplicación Móvil'],
      [],
      ['Total de Centros de Adopción', this.totalCentrosAdopcion],
      ['Total de Mensajes', this.totalMensajes],
      ['Total de Publicaciones', this.totalPublicaciones],
      ['Total de Solicitudes de Adopción', this.totalSolicitudesAdopcion],
      ['Total de Usuarios', this.totalUsuarios],
    ];
  
    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');
    XLSX.writeFile(workbook, 'reporte-aplicacion.xlsx');
  }

 

  imprimirReporte() {
    const printContents = document.getElementById('printable-report');
    
    if (printContents) {
      html2canvas(printContents, {
        scale: 1.2, // Escala ajustada para reducir el tamaño general
        useCORS: true
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
  
        // Crear una ventana emergente para la vista de impresión
        const popupWin = window.open('', '_blank', 'width=800,height=600');
  
        // Escribir el contenido HTML en la ventana emergente
        popupWin?.document.open();
        popupWin?.document.write(`
          <html>
            <head>
              <title>Reporte de la Aplicación Móvil</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 0; /* Sin márgenes para maximizar el espacio */
                  padding: 10px; /* Margen ligero para ajustar el contenido */
                  text-align: center;
                }
                h1 {
                  color: #1976D2;
                  font-size: 16px; /* Título más pequeño */
                  margin: 10px 0; /* Margen superior e inferior */
                }
                img {
                  width: 50%; /* Reducir la imagen al 50% del ancho de la página */
                  height: auto;
                  margin: 5px auto; /* Centrar y reducir márgenes */
                }
              </style>
            </head>
            <body>
              <h1>Reporte de la Aplicación Móvil para la Adopción Responsable</h1>
              <img src="${imgData}" alt="Gráfico de Estadísticas" />
              <script>
                window.onload = function() {
                  window.print();
                  window.onafterprint = function() {
                    window.close();
                  };
                };
              </script>
            </body>
          </html>
        `);
  
        popupWin?.document.close();
      }).catch((error) => {
        console.error('Error al generar la imagen del gráfico:', error);
      });
    } else {
      console.error('No se encontró el área de impresión.');
    }
  }
  
  
  
  

  
  calcularTiempoRespuesta(fechaInicio: Date, fechaFin: Date) {
    const diff = fechaFin.getTime() - fechaInicio.getTime();
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${dias} días`;
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
 // Confirmar eliminación del usuario
async confirmarEliminacionUsuario(usuario: any) {
  // Verificar si el usuario que se quiere eliminar es el usuario logueado
  const currentUser = await this.afAuth.currentUser;

  if (currentUser && currentUser.uid === usuario.uid) {
    // Mostrar una alerta indicando que no se puede eliminar a sí mismo
    const alert = await this.alertController.create({
      header: 'Acción no permitida',
      message: 'No puedes eliminar tu propia cuenta.',
      buttons: ['OK'],
    });
    await alert.present();
    return; // Detener la ejecución
  }

  // Si no es el usuario actual, mostrar la alerta de confirmación de eliminación
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
