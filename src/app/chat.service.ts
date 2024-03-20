import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private mensajesCollection: AngularFirestoreCollection<any>;
  mensajes: Observable<any[]>;

  constructor(private afs: AngularFirestore) {
    this.mensajesCollection = this.afs.collection<any>('mensajes');
    this.mensajes = this.mensajesCollection.valueChanges();
  }

  enviarMensaje(mensaje: any) {
    this.mensajesCollection.add(mensaje)
  }

  obtenerMensajes() {
    return this.mensajes.pipe(
      map((mensajes) => mensajes.sort((a, b) => a.timestamp - b.timestamp))
    );
  }
}
