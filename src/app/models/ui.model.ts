export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';
export type TableSortDir = 'asc' | 'desc' | null;

export interface TableColumn {
  /** Clave del dato (propiedad del row) o nombre lógico que usarás en el slot kCell */
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: 'start' | 'center' | 'end';
}
