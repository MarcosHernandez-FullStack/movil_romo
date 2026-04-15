import { Component, EventEmitter, Input, Output, inject, signal, effect } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export type NavItem = {
  label: string;
  route?: string;
  icon?: string;
  badge?: string | number;
  children?: NavItem[];
  command?: () => void;
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

@Component({
  standalone: true,
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  private router = inject(Router);

  /** Off-canvas movil */
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();

  /** Modo mini (icon-only) en desktop */
  @Input() collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  /** Menu */
  private readonly _nav = signal<NavSection[]>([]);
  @Input({ required: true })
  set nav(value: NavSection[]) {
    this._nav.set(value ?? []);
  }
  get nav(): NavSection[] {
    return this._nav();
  }

  /** Branding */
  @Input() brandTitle = 'Panel Softbrilliance';
  @Input() brandIcon = 'SB';

  /** Evento al navegar (para cerrar en movil, tracking, etc.) */
  @Output() navigate = new EventEmitter<string | undefined>();

  /** Estado de grupos abiertos (solo en modo expandido) */
  private openMap = signal<Record<string, boolean>>({});

  constructor() {
    effect(() => {
      const navSnapshot = this._nav();
      this.expandParentsForUrl(this.router.url, navSnapshot);
    });

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe((e: NavigationEnd) =>
        this.expandParentsForUrl(e.urlAfterRedirects || e.url, this._nav())
      );
  }

  key(si: number, ii: number) {
    return `${si}:${ii}`;
  }
  isOpen(k: string) {
    return !!this.openMap()[k];
  }

  toggleGroup(k: string) {
    if (this.collapsed) return;
    this.openMap.update((cur) => ({ ...cur, [k]: !cur[k] }));
  }

  setOpen(v: boolean) {
    this.open = v;
    this.openChange.emit(this.open);
  }

  setCollapsed(val: boolean) {
    this.collapsed = val;
    this.collapsedChange.emit(this.collapsed);
  }

  onNavigate(route?: string, command?: () => void) {
    command?.();
    this.navigate.emit(route);
    this.setOpen(false);
  }

  private expandParentsForUrl(url: string, nav: NavSection[]) {
    const next: Record<string, boolean> = {};
    nav.forEach((sec, si) => {
      sec.items.forEach((it, ii) => {
        const k = this.key(si, ii);
        if (it.children?.length) {
          const hit = it.children.some(
            (c) => !!c.route && (url === c.route || url.startsWith(c.route + '/'))
          );
          if (hit) next[k] = true;
        }
      });
    });
    this.openMap.set(next);
  }
  toggleCollapsed() {
    this.setCollapsed(!this.collapsed);
  }
}
