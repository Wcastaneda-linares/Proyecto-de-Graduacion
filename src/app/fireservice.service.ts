import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { AlertController, ToastController } from '@ionic/angular'; 


@Injectable({
  providedIn: 'root',
})
export class FireserviceService {
  constructor(
    public auth: AngularFireAuth,
    public afAuth: AngularFireAuth,
    public firestore: AngularFirestore,
    private toastController: ToastController, 
    private alertController: AlertController 
    
  ) {}

  

  async login(credentials: { email: string; password: string }): Promise<any> {
    const { email, password } = credentials;
    const userCredential = await this.afAuth.signInWithEmailAndPassword(email, password);
    const uid = userCredential.user?.uid;

    if (uid) {
      const userDoc = await this.firestore.collection('users').doc(uid).ref.get();
      const userData = userDoc.data() as { role: string; name: string };

      if (userData) {
        localStorage.setItem('authToken', 'true');
        localStorage.setItem('userRole', userData.role);
        console.log(`Usuario: ${userData.name}, Rol: ${userData.role}`);
      }
    }
    return userCredential;
  }

  async obtenerNombreUsuario(correo: string): Promise<string> {
    try {
      const usuarioSnapshot = await this.firestore
        .collection('users')
        .ref.where('email', '==', correo)
        .get();
  
      if (!usuarioSnapshot.empty) {
        const usuarioData = usuarioSnapshot.docs[0].data() as { name: string };
        console.log('Nombre del usuario encontrado:', usuarioData.name); // Verifica
        return usuarioData.name || 'Desconocido';
      } else {
        console.warn('Usuario no encontrado en Firestore');
        return 'Usuario Desconocido';
      }
    } catch (error) {
      console.error('Error al obtener el nombre del usuario:', error);
      return 'Usuario Desconocido';
    }
  }
  


  signUP(data: any): Promise<any> {
    return this.auth.createUserWithEmailAndPassword(data.email, data.password)
      .then(userCredential => {
        const user = userCredential.user;
        if (user) {
          const userData = {
            uid: user.uid,
            email: user.email,
            name: data.name || 'Usuario Anónimo',
            role: 'user',  // Rol por defecto
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          };
          return this.saveDetails(userData);
        }
        return Promise.reject('Error al crear el usuario');
      });
  }
  
  async updateUserRole(uid: string, role: string): Promise<void> {
    try {
      const doc = await this.firestore.collection('users').doc(uid).get().toPromise();
      if (doc && doc.exists) {
        await this.firestore.collection('users').doc(uid).update({ role });
        console.log(`Rol del usuario con ID ${uid} cambiado a ${role}`);
      } else {
        throw new Error(`No se encontró el usuario con ID: ${uid}`);
      }
    } catch (error) {
      console.error('Error al cambiar el rol del usuario:', error);
      throw error;
    }
  }
  
  
  
  async eliminarCentro(centro: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que deseas eliminar el centro "${centro.nombre}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Eliminación cancelada');
          },
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.procesarEliminacion(centro); // Llama a la función de eliminación
          },
        },
      ],
    });

    await alert.present();
  }

  

  async procesarEliminacion(centro: any) {
    try {
      await this.firestore.collection('centros').doc(centro.id).delete(); // Elimina el centro de Firestore
      this.mostrarToast(`Centro "${centro.nombre}" eliminado con éxito.`);
      console.log(`Centro eliminado: ${centro.nombre}`);
    } catch (error) {
      console.error('Error al eliminar el centro:', error);
      this.mostrarToast('Hubo un error al eliminar el centro.');
    }
  }

  // Muestra un mensaje de éxito o error en un toast
  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
    });
    toast.present();
  }
  

  saveDetails(data: any): Promise<void> {
    return this.firestore.collection('users').doc(data.uid).set(data);
  }

  getDetails(data: any): Observable<any> {
    return this.firestore.collection('users').doc(data.uid).valueChanges();
  }

  // Método para registrar un Hogar para animales
registrarCentroAdopcion(data: any): Promise<any> {
  return this.firestore.collection('centros_adopcion').add(data);
}

// Método para obtener los Hogares para animales
obtenerCentrosAdopcion(): Observable<any[]> {
  return this.firestore.collection('centros_adopcion').valueChanges({ idField: 'id' });
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
