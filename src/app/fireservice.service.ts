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
