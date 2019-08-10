import { Component, OnInit, Output, EventEmitter, ViewEncapsulation, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { ILogin } from '../../modules/login';
import { AuthService } from '../../auth/auth.service';
import { APIService } from '../../service/api.service';
import { SharedService } from '../../service/shared.service';
import { MessageService } from '../../service/message.service';
import { ValidationMessageService } from '../../service/validation-msg.service';
import { pipe } from 'rxjs';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {
  user: {};
  model: ILogin = { emailId: 'admin@gmail.com', password: 'admin123' };
  loginForm: FormGroup;
  message: string;
  returnUrl: string;
  submitted = false;
  errorData: any;

  constructor(
    private titleService: Title,
    private formBuilder: FormBuilder,
    private router: Router,
    public authService: AuthService,
    private apiService: APIService,
    private sharedService: SharedService,
    private msgService: MessageService,
    private el: ElementRef,
    private validErrorMsgService: ValidationMessageService
  ) {
      this.router.events.pipe(
        filter(event => event instanceof ActivationEnd)
      ).subscribe(event => {
        this.titleService.setTitle(event['snapshot'].data['title']);
      });
  }

  ngOnInit() {
    this.returnUrl = '/';
    this.createForm();
    this.validationErrorMsg();
    this.authService.logout();
  }

  createForm() {
    this.loginForm = this.formBuilder.group({
      emailId: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }


  login() {
    this.submitted = true;
    const invalidElements = this.el.nativeElement.querySelectorAll('.form-control.ng-invalid');
    console.log(invalidElements, invalidElements.length);
    if (invalidElements.length > 0) {
      console.log(invalidElements[0]);
      invalidElements[0].focus();
    } else {
      if (this.loginForm.get('emailId').value === this.model.emailId && this.loginForm.get('password').value === this.model.password) {
        this.authService.login(this.loginForm.get('emailId').value, this.loginForm.get('password').value)
          .pipe(first())
          .subscribe(
            data => {
              this.router.navigate([this.returnUrl]);
            },
            error => {
              this.message = error;
            });
      } else {
        this.message = 'Please check your emailId and password';
      }
    }
}


/*
  *** Get API response as validation error json and load response in validationErrorObj of validErrorMsgService
  */
 validationErrorMsg() {
  this.apiService.getValidationErrorMessage().then(
    (res) => {
      if (this.validErrorMsgService.validationErrorObj.length === 0) {
        this.validErrorMsgService.validationErrorObj = res['validationErrors'];
        console.log('Validation Error => ', this.validErrorMsgService.validationErrorObj);
      }
    }, (error) => {
      this.errorData = this.sharedService.getErrorKeys(error.statusText);
    });
}

}
