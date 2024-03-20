import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FireserviceService } from '../fireservice.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  public email: any;
  public password: any;
  public name: any;

  constructor(public fireService: FireserviceService, private router: Router) {}

  ngOnInit() {}
  onSubmit() {
    this.fireService
      .signUP({ email: this.email, password: this.password })
      .then((res) => {
        if (res && res.user && res.user.uid) {
          let data = {
            email: this.email,
            password: this.password,
            name: this.name,
            uid: res.user.uid,
          };
          this.fireService.saveDetails(data).then(
            (res) => {
              this.router.navigate(['/login']);
              console.log('Cuenta creada');
            },
            (err) => {
              console.log(err);
            }
          );
        }
      });
  }
}
