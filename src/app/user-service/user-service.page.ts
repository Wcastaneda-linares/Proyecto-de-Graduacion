import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
@Component({
  selector: 'app-user-service',
  templateUrl: './user-service.page.html',
  styleUrls: ['./user-service.page.scss'],
})
export class UserService implements OnInit {
  constructor(private firestore: AngularFirestore) {}

  ngOnInit() {}
  getDetails(uid: string): Promise<any> {
    // Supongamos que en tu colección 'users' tienes documentos con los detalles de cada usuario,
    // donde el UID del usuario es el ID del documento.
    return this.firestore
      .collection('users')
      .doc(uid)
      .ref.get()
      .then((doc) => {
        if (doc.exists) {
          // Devuelve los datos del documento (detalles del usuario).
          return doc.data();
        } else {
          // Si el documento no existe, devuelve un objeto vacío o un mensaje de error, según tu necesidad.
          return {};
        }
      })
      .catch((error) => {
        console.error('Error al obtener detalles del usuario: ', error);
        // Devuelve un objeto vacío o un mensaje de error, según tu necesidad.
        return {};
      });
  }
}
