import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { showAlert } from '../../../shared/utils/sweetAlert';

type GoogleCredentialResponse = {
  credential: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }): void;
          renderButton(target: HTMLElement, options: Record<string, unknown>): void;
          prompt(): void;
          cancel(): void;
        };
      };
    };
  }
}

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private ngZone = inject(NgZone);
  private platformId = inject(PLATFORM_ID);

  @ViewChild('googleBtn', { static: false })
  googleButton?: ElementRef<HTMLDivElement>;

  loading = false;
  errorMsg = '';
  googleError = '';
  private googleClientPromise?: Promise<void>;
  private googleReady = false;
  private viewReady = false;
  private googleButtonRendered = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.loadGoogleClient()
      .then(() => {
        this.ngZone.run(() => {
          this.googleReady = true;
          this.renderGoogleButton();
        });
      })
      .catch((err) => {
        this.ngZone.run(() => {
          console.warn('Google Sign-In init failed', err);
          this.googleError = 'No se pudo cargar Google. Intenta de nuevo mas tarde.';
          showAlert('Error ', this.googleError, 'error');
        });
      });
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    this.viewReady = true;
    this.renderGoogleButton();
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;
    window.google?.accounts.id.cancel();
  }

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMsg = '';
    this.googleError = '';
    const { email, password } = this.form.getRawValue();
    this.auth.login(email!, password!).subscribe({
      next: () => this.handleLoginSuccess(),
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.mensaje || 'Credenciales inválidas';
        showAlert('Error', this.errorMsg, 'error');
      },
    });
  }

  private handleLoginSuccess() {
    this.loading = false;
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || 'mobile/services';
    this.router.navigateByUrl(returnUrl);
  }

  private renderGoogleButton(): void {
    if (!this.googleReady || !this.viewReady || this.googleButtonRendered) return;
    if (!environment.googleClientId) {
      this.googleError = 'Configura el Client ID de Google en los environments.';
      showAlert('Error ', this.googleError, 'error');
      return;
    }
    const api = window.google?.accounts?.id;
    const target = this.googleButton?.nativeElement;
    if (!api || !target) return;

    target.innerHTML = '';
    api.initialize({
      client_id: environment.googleClientId,
      callback: (response: GoogleCredentialResponse) =>
        this.ngZone.run(() => this.onGoogleCredential(response)),
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    api.renderButton(target, {
      theme: 'outline',
      size: 'large',
      width: '100%',
      text: 'continue_with',
      shape: 'pill',
    });
    api.prompt();
    this.googleButtonRendered = true;
  }

  private onGoogleCredential(response: GoogleCredentialResponse): void {
    if (!response?.credential) return;
    this.loading = true;
    this.errorMsg = '';
    this.googleError = '';
    console.log(response.credential);
    this.auth.loginWithGoogle(response.credential).subscribe({
      next: () => this.handleLoginSuccess(),
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'No se pudo iniciar sesión con Google.';
        showAlert('Error ', this.errorMsg, 'error');
      },
    });
  }

  private loadGoogleClient(): Promise<void> {
    if (this.googleClientPromise) return this.googleClientPromise;

    this.googleClientPromise = new Promise<void>((resolve, reject) => {
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }

      const existing = document.getElementById('google-signin-script') as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('google script load error')), {
          once: true,
        });
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-signin-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('google script load error'));
      document.head.appendChild(script);
    }).then(() => {
      if (!window.google?.accounts?.id) {
        throw new Error('google.accounts.id API no disponible');
      }
    });

    return this.googleClientPromise;
  }
}
