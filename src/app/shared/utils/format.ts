export function fmtMoney(value: number | string, currency = 'PEN'): string {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(n);
}

export function fmtDate(date: string | Date, withTime = false): string {
  const d = new Date(date);
  const opts: Intl.DateTimeFormatOptions = withTime
    ? { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: '2-digit', year: 'numeric' };
  return new Intl.DateTimeFormat('es-PE', opts).format(d);
}

export const fmtCapitalize = (s = '') => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
