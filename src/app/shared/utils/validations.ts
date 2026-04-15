import { AbstractControl, ValidationErrors } from '@angular/forms';

export function requiredTrim(control: AbstractControl): ValidationErrors | null {
  const value = control.value?.trim?.() ?? '';
  return value ? null : { requiredTrim: true };
}

export function phoneValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value ?? '';
  const ok = /^\d{9}$/.test(value);
  return ok ? null : { phone: true };
}

export function emailValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value ?? '';
  const ok = /^[\w.-]+@[\w.-]+\.\w{2,}$/i.test(value);
  return ok ? null : { email: true };
}
