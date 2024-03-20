import { Injectable, Inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';



@Injectable({
  providedIn: 'root',
})
export class FireserviceService {
  obtenerUsuariosDisponibles() {
    throw new Error('Method not implemented.');
  }
  constructor(
    public auth: AngularFireAuth,
    public firestore: AngularFirestore
  ) {}
  

  login(data: any) {
    return this.auth.signInWithEmailAndPassword(data.email, data.password);
  }
  signUP(data: any) {
    return this.auth.createUserWithEmailAndPassword(data.email, data.password);
  }
  saveDetails(data: any) {
    return this.firestore.collection('users').doc(data.uid).set(data);
  }
  getDetails(data: any) {
    return this.firestore.collection('users').doc(data.uid).valueChanges();
  }
  async getUsuarioLogueado() {
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
}
