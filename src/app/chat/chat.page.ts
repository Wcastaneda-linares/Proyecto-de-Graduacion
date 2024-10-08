import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  mensajes: any[] = [];
  nuevoMensaje: string = '';
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  usuario: string = '';  // Variable para almacenar el nombre del usuario logueado

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.usuario = localStorage.getItem('usuario') || 'Desconocido';  // Obtener el nombre del usuario del localStorage
    this.obtenerMensajes();
  }

  enviarMensaje() {
    if (this.nuevoMensaje.trim()) {
      const mensaje = {
        contenido: this.nuevoMensaje,
        usuario: this.usuario,  // Incluir el nombre del usuario en el mensaje
        timestamp: new Date().getTime(),
      };
      this.chatService.enviarMensaje(mensaje);
      this.nuevoMensaje = '';
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  obtenerMensajes() {
    this.chatService.obtenerMensajes().subscribe((mensajes: any[]) => {
      this.mensajes = mensajes;
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  private scrollToBottom() {
    if (this.chatContainer) {
      setTimeout(() => {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }, 100);
    }
  }
}
