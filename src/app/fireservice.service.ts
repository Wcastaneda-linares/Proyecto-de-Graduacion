import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FireserviceService {
  constructor(
    public auth: AngularFireAuth,
    public firestore: AngularFirestore
  ) {}

  login(data: any): Promise<any> {
    return this.auth.signInWithEmailAndPassword(data.email, data.password);
  }

  signUP(data: any): Promise<any> {
    return this.auth.createUserWithEmailAndPassword(data.email, data.password);
  }

  saveDetails(data: any): Promise<void> {
    return this.firestore.collection('users').doc(data.uid).set(data);
  }

  getDetails(data: any): Observable<any> {
    return this.firestore.collection('users').doc(data.uid).valueChanges();
  }

  // Esta es la función que faltaba para obtener el nombre del usuario
  async obtenerNombreUsuario(correo: string): Promise<string> {
    try {
      const usuarioSnapshot = await this.firestore
        .collection('users')
        .ref.where('email', '==', correo)
        .get();

      if (!usuarioSnapshot.empty) {
        const usuarioData = usuarioSnapshot.docs[0].data() as { name: string };
        return usuarioData.name || 'Desconocido';  // Retorna el nombre del usuario o 'Desconocido' si no está definido
      } else {
        return 'Usuario Desconocido';
      }
    } catch (error) {
      console.error('Error al obtener el nombre del usuario: ', error);
      return 'Usuario Desconocido';
    }
  }
  
  actualizarPublicacion(publicacion: any) {
    return this.firestore.collection('publicaciones').doc(publicacion.id).update({
      nombreMascota: publicacion.nombreMascota,
      razaMascota: publicacion.razaMascota,
      edadMascota: publicacion.edadMascota,
      descripcionMascota: publicacion.descripcionMascota,
      tipoMascota: publicacion.tipoMascota,
      estadoSaludMascota: publicacion.estadoSaludMascota,
      imagenURL: publicacion.imagenURL,
      // Información del donante (si la tienes)
      donante: {
        nombre: publicacion.nombreDonante || 'Desconocido',
        numeroContacto: publicacion.numeroDonante || 'No disponible',
        correo: publicacion.correoDonante || 'No disponible',
        direccion: publicacion.direccionDonante || 'No disponible',
        numeroDocumentoIdentificacion: publicacion.numeroDocumentoIdentificacion || 'No disponible'
      }
    });
  }
  

  updatePublicacion(id: string, data: any) {
    return this.firestore.collection('publicaciones').doc(id).update(data);
  }

    // Método para actualizar la publicación

    
  async getUsuarioLogueado(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.auth.authState.subscribe(
        (user: any) => {
          resolve(user);
        },
        (error: any) => {
          reject(error);
        }
      );
    });
  }

  

  getUsers(): Observable<any[]> {
    return this.firestore.collection('users').valueChanges();
  }

  deleteUser(uid: string) {
    return this.firestore.collection('users').doc(uid).delete();
  }

  

  updateUser(usuario: any) {
    return this.firestore.collection('users').doc(usuario.uid).update(usuario);
  }

  getPublicaciones() {
    return this.firestore.collection('publicaciones').valueChanges({ idField: 'id' });
  }
  
  eliminarPublicacion(id: string) {
    return this.firestore.collection('publicaciones').doc(id).delete();
  }
  
  getSolicitudesAdopcion() {
    return this.firestore.collection('solicitudes_adopcion').valueChanges({ idField: 'id' });
  }
  
  actualizarEstadoSolicitud(id: string, estado: string) {
    return this.firestore.collection('solicitudes_adopcion').doc(id).update({ estado });
  }
  

  getUsersWithLastSignIn(): Observable<any[]> {
    return this.firestore.collection('users').snapshotChanges().pipe(
      switchMap(actions => {
        return of(actions.map(a => {
          const data = a.payload.doc.data() as any;
          const id = a.payload.doc.id;
          return { id, ...data };
        }));
      })
    );
  }

  logout(): Promise<void> {
    return this.auth.signOut();
  }
}
