import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';

import { ModalComponent } from '../../../shared/modal/modal.component';
import { UserService } from '../../../core/services/user.service';
import { UserView } from '../../../models/user.view.model';

type RoleItem = { idRolUsuario: number; rol: string };

type UserForm = {
  fullName: FormControl<string>;
  email: FormControl<string>;
  username: FormControl<string>;
  phone: FormControl<string>;
  roleId: FormControl<number | null>;
};
@Component({
  standalone: true,
  selector: 'app-user-form',
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent implements OnInit, OnChanges {
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();
  @Input() userId: number | null = null;

  @Output() saved = new EventEmitter<UserView>();

  private fb = inject(FormBuilder);
  private svc = inject(UserService);

  loading = false;
  saving = false;
  submitted = false;
  error: string | null = null;
  roles = signal<RoleItem[]>([]);

  form = this.fb.group<UserForm>({
    fullName: this.fb.nonNullable.control('', {
      validators: [Validators.required, Validators.minLength(3)],
    }),
    email: this.fb.nonNullable.control('', { validators: [Validators.required, Validators.email] }),
    username: this.fb.nonNullable.control('', { validators: [Validators.required] }),
    phone: this.fb.nonNullable.control('', {
      validators: [Validators.required, Validators.pattern(/^\d{9}$/)],
    }),
    roleId: this.fb.control<number | null>(null, {
      validators: [Validators.required, Validators.min(1), Validators.max(15)],
    }),
  });

  get isEdit() {
    return this.userId != null;
  }
  get title() {
    return this.isEdit ? 'Editar usuario' : 'Nuevo usuario';
  }

  ngOnInit() {
    this.svc.getRoles().subscribe({
      next: (data) => this.roles.set(data),
      error: () => this.roles.set([]),
    });
    if (this.open) this.loadIfEdit();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (('userId' in changes || 'open' in changes) && this.open) {
      this.loadIfEdit();
    }
  }

  private loadIfEdit() {
    this.error = null;
    if (!this.isEdit || this.userId == null) {
      this.form.reset({ fullName: '', email: '', username: '', phone: '', roleId: null });
      return;
    }
    this.loading = true;
    this.svc.getById(this.userId).subscribe({
      next: (u) => {
        this.loading = false;
        if (!u) {
          this.error = 'Usuario no encontrado';
          return;
        }
        this.form.patchValue({
          fullName: u.fullName,
          email: u.email,
          username: u.username,
          phone: String(u.phone ?? '').padStart(9, '0'),
          roleId: u.roleId ?? null,
        });
      },
      error: (e) => {
        this.loading = false;
        this.error = e?.message ?? 'Error al cargar';
      },
    });
  }

  close() {
    this.open = false;
    this.openChange.emit(false);
  }

  submit() {
    this.submitted = true;
    this.error = null;
    if (this.form.invalid) return;

    this.saving = true;
    const { fullName, email, username, phone, roleId } = this.form.getRawValue();
    const dto: Partial<UserView> = {
      fullName,
      email,
      username,
      phone: Number(phone),
      roleId: roleId ?? undefined,
    };

    const req$ =
      this.isEdit && this.userId != null
        ? this.svc.updateFromView(this.userId, dto)
        : this.svc.createFromView(dto);

    req$.subscribe({
      next: (savedUser) => {
        this.saving = false;
        this.saved.emit(savedUser);
        this.close();
      },
      error: (e) => {
        this.saving = false;
        const errors = e?.error?.Errors as string[] | undefined;
        this.error = errors?.join(' • ') || e?.message || 'Error al guardar';
      },
    });
  }
}
