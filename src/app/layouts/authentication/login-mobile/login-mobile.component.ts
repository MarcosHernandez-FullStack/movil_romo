import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login-mobile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-mobile.component.html',
  styleUrls: ['./login-mobile.component.scss']
})
export class LoginMobileComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = false;
  showPassword = false;
  errorMessage = '';

  form = this.fb.group({
    usuario:  ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  submit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const { usuario, password } = this.form.getRawValue();
    this.auth.login(usuario!, password!).subscribe({
      next: () => this.handleLoginSuccess(),
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.mensaje || 'Credenciales inválidas';
      },
    });
  }

  private handleLoginSuccess(): void {
    this.loading = false;

    if (this.auth.role !== 'OPERADOR') {
      this.auth.logout();
      this.errorMessage = 'Credenciales inválidas';
      return;
    }

    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || 'mobile/services';
    this.router.navigateByUrl(returnUrl);
  }
}
