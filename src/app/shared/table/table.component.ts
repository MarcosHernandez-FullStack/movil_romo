import {
  Component,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
  ContentChildren,
  QueryList,
  Directive,
  Input as NgInput,
} from '@angular/core';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableSortDir, TableColumn } from '../../models/ui.model';

@Directive({ selector: 'ng-template[Cell]' })
export class CellDirective {
  @NgInput('Cell') key!: string;
  constructor(public tpl: TemplateRef<any>) {}
}

@Component({
  standalone: true,
  selector: 'app-table',
  imports: [CommonModule, FormsModule, NgTemplateOutlet],
  styleUrls: ['./table.component.scss'],
  templateUrl: './table.component.html',
})
export class TableComponent {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];

  @Input() selectable = false;
  @Input() rowClickTogglesSelection = true;
  @Input() rowIdKey = 'id';
  @Output() selectionChange = new EventEmitter<any[]>();
  private selected = new Set<any>();
  sortKey: string | null = null;
  sortDir: TableSortDir = null;
  @Output() sortChange = new EventEmitter<{ key: string | null; dir: TableSortDir }>();
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 20, 50];
  page = 1;
  @Output() pageChange = new EventEmitter<{ page: number; pageSize: number }>();

  @ContentChildren(CellDirective) cellTpls!: QueryList<CellDirective>;

  get total(): number {
    return this.sortedData.length;
  }
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  get fromIndex(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
  }
  get toIndex(): number {
    return Math.min(this.page * this.pageSize, this.total);
  }

  get sortedData(): any[] {
    if (!this.sortKey || !this.sortDir) return [...this.data];
    const dir = this.sortDir === 'asc' ? 1 : -1;
    return [...this.data].sort((a, b) => {
      const va = this.valueOf(a, this.sortKey!);
      const vb = this.valueOf(b, this.sortKey!);
      if (va == null && vb == null) return 0;
      if (va == null) return -1 * dir;
      if (vb == null) return 1 * dir;
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      const da = new Date(va as any),
        db = new Date(vb as any);
      if (!isNaN(+da) && !isNaN(+db)) return (+da - +db) * dir;
      return String(va).localeCompare(String(vb)) * dir;
    });
  }

  get pagedData(): any[] {
    const start = (this.page - 1) * this.pageSize;
    return this.sortedData.slice(start, start + this.pageSize);
  }

  toggleSort(col: TableColumn) {
    if (!col.sortable) return;
    if (this.sortKey !== col.key) {
      this.sortKey = col.key;
      this.sortDir = 'asc';
    } else {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : this.sortDir === 'desc' ? null : 'asc';
      if (!this.sortDir) this.sortKey = null;
    }
    this.page = 1;
    this.sortChange.emit({ key: this.sortKey, dir: this.sortDir });
  }

  isSelected(row: any) {
    return this.selected.has(this.rowId(row));
  }
  rowId(row: any) {
    return row?.[this.rowIdKey];
  }

  toggleRow(row: any, checked: boolean) {
    const id = this.rowId(row);
    if (id == null) return;
    if (checked) this.selected.add(id);
    else this.selected.delete(id);
    this.selectionChange.emit(this.data.filter((r) => this.selected.has(this.rowId(r))));
  }

  allVisibleSelected(): boolean {
    return this.pagedData.every((r) => this.selected.has(this.rowId(r)));
  }
  toggleAllVisible(checked: boolean) {
    this.pagedData.forEach((r) => {
      const id = this.rowId(r);
      if (id == null) return;
      if (checked) this.selected.add(id);
      else this.selected.delete(id);
    });
    this.selectionChange.emit(this.data.filter((r) => this.selected.has(this.rowId(r))));
  }

  setPage(p: number) {
    this.page = Math.min(Math.max(1, p), this.totalPages);
    this.pageChange.emit({ page: this.page, pageSize: this.pageSize });
  }
  setPageSize(n: number) {
    this.pageSize = n;
    this.page = 1;
    this.pageChange.emit({ page: this.page, pageSize: this.pageSize });
  }

  tplFor(key: string): TemplateRef<any> | null {
    const found = this.cellTpls?.find((t) => t.key === key);
    return found?.tpl ?? null;
  }

  valueOf(obj: any, path: string) {
    return path.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
  }

  onRowClick(row: any, ev: MouseEvent) {
    if (!this.selectable || !this.rowClickTogglesSelection) return;
    const t = ev.target as HTMLElement;
    if (t.closest('button, a, input, label, [data-stop]')) return;
    this.toggleRow(row, !this.isSelected(row));
  }
}
