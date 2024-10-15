import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private mensajesCollection: AngularFirestoreCollection<any>; // Declaración correcta

  constructor(private afs: AngularFirestore) {
    // Inicializar la colección de mensajes
    this.mensajesCollection = this.afs.collection<any>('mensajes');
  }

  obtenerMensajes(): Observable<any[]> {
    return this.mensajesCollection
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...(data as any) };
          })
        )
      );
  }

  async agregarRespuesta(mensajeId: string, respuesta: any): Promise<void> {
    try {
      const doc = await this.afs.collection('mensajes').doc(mensajeId).get().toPromise();
      if (doc?.exists) {
        await this.afs.collection('mensajes').doc(mensajeId).update({
          respuestas: firebase.firestore.FieldValue.arrayUnion(respuesta),
        });
        console.log('Respuesta agregada correctamente');
      } else {
        console.error('El mensaje no existe');
      }
    } catch (error) {
      console.error('Error al agregar respuesta:', error);
    }
  }

  enviarMensaje(mensaje: any) {
    console.log('Enviando mensaje:', mensaje); // Verificar el contenido en consola
    return this.mensajesCollection.add(mensaje) // Usa la colección inicializada correctamente
      .then(() => {
        console.log('Mensaje enviado correctamente');
      })
      .catch((error: any) => {
        console.error('Error al enviar mensaje:', error);
      });
  }
  

  async enviarNotificacion(userId: string, mensaje: string): Promise<void> {
    const notificacion = {
      mensaje,
      fecha: new Date().toISOString(),
      leida: false,
    };

    try {
      const doc = await this.afs.collection('users').doc(userId).get().toPromise();
      if (doc?.exists) {
        await this.afs.collection('users').doc(userId).update({
          notificaciones: firebase.firestore.FieldValue.arrayUnion(notificacion),
        });
        console.log('Notificación enviada correctamente');
      } else {
        console.error('El usuario no existe');
      }
    } catch (error) {
      console.error('Error al enviar notificación:', error);
    }
  }
}
