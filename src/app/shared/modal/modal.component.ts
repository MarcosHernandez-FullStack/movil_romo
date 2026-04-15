import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalSize } from '../../models/ui.model';

@Component({
  standalone: true,
  selector: 'app-modal',
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();
  @Input() title = 'Modal';
  @Input() size: ModalSize = 'md';
  @Input() closeOnBackdrop = true;
  @Input() showDefaultHeader = true;

  close() {
    this.setOpen(false);
  }
  setOpen(v: boolean) {
    this.open = v;
    this.openChange.emit(v);
  }

  onBackdrop(e: MouseEvent) {
    if (!this.closeOnBackdrop) return;
    const target = e.target as HTMLElement;
    if (target.classList.contains('modal__backdrop')) this.close();
  }

  get dialogClass() {
    return {
      'modal__dialog--sm': this.size === 'sm',
      'modal__dialog--lg': this.size === 'lg',
      'modal__dialog--xl': this.size === 'xl',
    };
  }
}
