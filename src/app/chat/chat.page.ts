import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit, AfterViewInit {
  mensajes: any[] = [];
  nuevoMensaje: string = '';
  respuestaMensaje: string = '';
  mensajeSeleccionado: any = null;
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  usuario: string = '';

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    const usuarioGuardado = localStorage.getItem('usuario');
    console.log('Usuario desde localStorage:', usuarioGuardado); // Verifica en la consola
  
    if (usuarioGuardado) {
      this.usuario = usuarioGuardado;
    } else {
      console.warn('No se encontró un usuario en localStorage');
      this.usuario = 'Desconocido';
    }
    this.obtenerMensajes();
  }
  
  
  
  
  
  ngAfterViewInit() {
    setTimeout(() => this.scrollToBottom(), 100);
  }

  enviarMensaje() {
    if (this.nuevoMensaje.trim()) {
      const mensaje = {
        contenido: this.nuevoMensaje,
        usuario: this.usuario || 'Desconocido', // Se asegura que usa el nombre
        timestamp: new Date().toISOString(),
        respuestas: [],
      };
      this.chatService.enviarMensaje(mensaje);
      this.nuevoMensaje = '';
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }
    

  enviarRespuesta() {
    if (!this.mensajeSeleccionado?.id) {
      console.error('No se seleccionó un mensaje válido para responder.');
      return;
    }
  
    const respuesta = {
      contenido: this.respuestaMensaje.trim(),
      usuario: this.usuario || 'Desconocido',
      timestamp: new Date().toISOString(),
    };
  
    this.chatService
      .agregarRespuesta(this.mensajeSeleccionado.id, respuesta)
      .then(() => {
        console.log('Respuesta enviada correctamente');
        this.respuestaMensaje = '';
        this.mensajeSeleccionado = null;
        setTimeout(() => this.scrollToBottom(), 100);
      })
      .catch((error) => console.error('Error al enviar respuesta:', error));
  }
  

  seleccionarMensaje(mensaje: any) {
    this.mensajeSeleccionado = mensaje;
  }

  obtenerMensajes() {
    this.chatService.obtenerMensajes().subscribe((mensajes: any[]) => {
      this.mensajes = mensajes;
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  private scrollToBottom() {
    try {
      if (this.chatContainer?.nativeElement) {
        this.chatContainer.nativeElement.scrollTop =
          this.chatContainer.nativeElement.scrollHeight;
      }
    } catch (error) {
      console.error('Error al hacer scroll:', error);
    }
  }
  
    
}
