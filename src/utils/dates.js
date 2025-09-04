// src/utils/dateFormat.js
export function toYMD(input, { utc = false } = {}) {

console.error(input);

  if (!input) return null;

  // 1) Date
  if (input instanceof Date && !isNaN(input)) {
    const y = utc ? input.getUTCFullYear() : input.getFullYear();
    const m = String((utc ? input.getUTCMonth() : input.getMonth()) + 1).padStart(2, '0');
    const d = String(utc ? input.getUTCDate() : input.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // 2) Timestamp numérico
  if (typeof input === 'number') {
    const dt = new Date(input);
    if (!isNaN(dt)) return toYMD(dt, { utc });
  }

  // 3) String ya en YYYY-MM-DD / ISO
  if (typeof input === 'string') {
    const s = input.trim();
    // yyyy-mm-dd (o iso -> recorta 10)
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);

    // dd/mm/yyyy o dd/mm/yy
    const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (m) {
      let [ , dd, mm, yy ] = m;
      if (yy.length === 2) yy = (Number(yy) + 2000).toString();
      return `${yy.padStart(4,'0')}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`;
    }

    // Como fallback, intentar parsear el string como fecha
    const dt = new Date(s);
    if (!isNaN(dt)) return toYMD(dt, { utc });
  }

  // Si no se pudo formatear, devuélvelo tal cual o null según prefieras
  return null;
}
