import { Component, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  mensajes: any[] = [];
  nuevoMensaje: string = '';

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.obtenerMensajes();
  }

  enviarMensaje() {
    const mensaje = {
      contenido: this.nuevoMensaje,
      timestamp: new Date().getTime(),
    };
    this.chatService.enviarMensaje(mensaje);
    this.nuevoMensaje = '';
  }

  obtenerMensajes() {
    this.chatService.obtenerMensajes().subscribe((mensajes: any[]) => {
      this.mensajes = mensajes;
    });
  }
}
