import Swal, { SweetAlertIcon } from 'sweetalert2';

export type AlertIcon = SweetAlertIcon;

export interface ConfirmResultPayload {
  title: string;
  text?: string;
  icon?: AlertIcon;
}

export function showAlert(
  title: string,
  text = '',
  icon: AlertIcon = 'info',
  confirmText = 'Aceptar'
): Promise<void> {
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonText: confirmText,
    confirmButtonColor: '#05679e',
    heightAuto: false,
  }).then(() => {});
}

interface AlertDialogOptions {
  title: string;
  text?: string;
  icon?: AlertIcon;
  showCancel?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | boolean | Promise<void | boolean | ConfirmResultPayload>;
  onAfterConfirm?: () => void;
}

export async function alertDialog(opts: AlertDialogOptions): Promise<boolean> {
  const {
    title,
    text = '',
    icon = 'warning',
    showCancel = true,
    confirmText = 'Sí, confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    onAfterConfirm,
  } = opts;

  const swal = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-danger',
      cancelButton: 'btn btn-light',
    },
    buttonsStyling: false,
    heightAuto: false,
  });

  const result = await swal.fire({
    title,
    text,
    icon,
    showCancelButton: showCancel,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
  });

  if (!result.isConfirmed) return false;

  if (!onConfirm) return true;

  try {
    const res = await onConfirm();
    if (res && typeof res === 'object' && 'title' in res) {
      await Swal.fire({
        title: (res as ConfirmResultPayload).title,
        text: (res as ConfirmResultPayload).text,
        icon: (res as ConfirmResultPayload).icon ?? 'success',
        timer: 1000,
        showConfirmButton: false,
        heightAuto: false,
      });
    } else if (res === true || res === undefined) {
      await Swal.fire({
        title: 'Operación exitosa',
        icon: 'success',
        timer: 900,
        showConfirmButton: false,
        heightAuto: false,
      });
    }

    if (onAfterConfirm) onAfterConfirm();
    return true;
  } catch (e) {
    await Swal.fire({
      title: 'Ocurrió un error',
      text: e instanceof Error ? e.message : 'No se pudo completar la operación.',
      icon: 'error',
      heightAuto: false,
    });
    return false;
  }
}

//EJEMPLOS DE USO
/*
await showAlert('Guardado', 'Los cambios se aplicaron correctamente', 'success', 'Listo');

const ok = await alertDialog({
  title: '¿Eliminar usuario?',
  text: 'Esta acción no se puede deshacer',
  icon: 'warning',
  onConfirm: async () => {
    await this.userService.delete(id).toPromise();
    return { title: 'Eliminado', text: 'El usuario fue eliminado', icon: 'success' };
  },
  onAfterConfirm: () => this.reload()
});
if (ok) {  }



await alertDialog({
  title: '¿Cerrar sesión?',
  icon: 'question',
  onConfirm: () => this.auth.logout()
});


*/
