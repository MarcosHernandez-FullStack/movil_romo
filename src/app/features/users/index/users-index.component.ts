import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { UserFormComponent } from '../form/user-form.component';

import { TableComponent, CellDirective } from '../../../shared/table/table.component';

import { UserService } from '../../../core/services/user.service';
import { TableColumn } from '../../../models/ui.model';
import { forkJoin } from 'rxjs';
import { UserView } from '../../../models/user.view.model';
import { ModalComponent } from '../../../shared/modal/modal.component';

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
  selector: 'app-users-index',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableComponent,
    CellDirective,
    UserFormComponent,
    ModalComponent,
  ],
  styleUrls: ['./users-index.component.scss'],
  templateUrl: './users-index.component.html',
})
export class UsersIndexComponent {
  private fb = inject(FormBuilder);
  private svc = inject(UserService);

  formOpen = false;
  editingId: number | null = null;

  cols: TableColumn[] = [
    { key: 'fullName', header: 'Nombre', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'username', header: 'Usuario', sortable: true, width: '140px', align: 'center' },
    { key: 'phone', header: 'Teléfono', sortable: true, width: '140px', align: 'end' },
    { key: 'role', header: 'Rol', sortable: true, width: '160px', align: 'center' },
    { key: 'actions', header: 'Acciones', width: '170px', align: 'end' },
  ];

  users = signal<UserView[]>([]);
  selected = signal<UserView[]>([]);
  loading = signal<boolean>(false);
  q = '';

  confirmOpen = false;
  saving = false;
  isEdit = false;

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

  toDeleteSingle: UserView | null = null;

  ngOnInit() {
    this.refresh();
    this.svc.getRoles().subscribe({
      next: (data) => this.roles.set(data),
      error: () => this.roles.set([]),
    });
  }

  refresh() {
    this.loading.set(true);
    this.svc.list(this.q).subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.users.set([]);
        this.loading.set(false);
      },
    });
  }
  search() {
    this.refresh();
  }

  onSel(list: UserView[]) {
    this.selected.set(list);
  }

  openCreate() {
    this.editingId = null;
    this.formOpen = true;
  }
  openEdit(u: UserView) {
    this.editingId = u.id;
    this.formOpen = true;
  }

  submitForm() {
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
      this.isEdit && this.editingId != null
        ? this.svc.updateFromView(this.editingId, dto)
        : this.svc.createFromView(dto);

    req$.subscribe({
      next: () => {
        this.saving = false;
        this.formOpen = false;
        this.refresh();
      },
      error: (e) => {
        this.saving = false;
        const errors = e?.error?.Errors as string[] | undefined;
        alert(errors?.join('\n') || e?.message || 'Error al guardar');
      },
    });
  }

  confirmDelete(u?: UserView) {
    this.toDeleteSingle = u ?? null;
    this.confirmOpen = true;
  }

  removeConfirmed() {
    const close = () => {
      this.confirmOpen = false;
      this.selected.set([]);
      this.refresh();
    };
    if (this.toDeleteSingle) {
      this.svc.remove(this.toDeleteSingle.id).subscribe({ next: close, error: close });
      return;
    }
    const list = this.selected();
    if (!list.length) {
      this.confirmOpen = false;
      return;
    }

    forkJoin(list.map((u) => this.svc.remove(u.id))).subscribe({ next: close, error: close });
  }
}
