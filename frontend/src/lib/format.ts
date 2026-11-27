export const rupiah = (n: number | undefined | null) => {
  if (n === undefined || n === null || isNaN(n)) return "Rp 0"
  return "Rp " + n.toLocaleString("id-ID")
}

/**
 * Format date to Indonesian format with WIB timezone
 * @param date Date string or Date object
 * @param format Format type: 'full', 'date', 'time', 'datetime'
 * @returns Formatted date string in WIB timezone
 */
export const formatDateWIB = (
  date: string | Date | undefined | null,
  format: 'full' | 'date' | 'time' | 'datetime' = 'datetime'
): string => {
  if (!date) return '-'
  
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '-'

  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Jakarta',
  }

  switch (format) {
    case 'full':
      options.weekday = 'long'
      options.year = 'numeric'
      options.month = 'long'
      options.day = 'numeric'
      options.hour = '2-digit'
      options.minute = '2-digit'
      options.second = '2-digit'
      break
    case 'date':
      options.year = 'numeric'
      options.month = 'long'
      options.day = 'numeric'
      break
    case 'time':
      options.hour = '2-digit'
      options.minute = '2-digit'
      options.second = '2-digit'
      break
    case 'datetime':
    default:
      options.year = 'numeric'
      options.month = 'short'
      options.day = 'numeric'
      options.hour = '2-digit'
      options.minute = '2-digit'
      break
  }

  return d.toLocaleString('id-ID', options) + ' WIB'
}

/**
 * Get current date/time in WIB
 */
export const nowWIB = (): Date => {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
}

/**
 * Generate a list of period strings in Indonesian format
 * @param count Number of periods to generate (default: 12)
 * @param includeCurrentMonth Whether to include current month (default: true)
 * @returns Array of period strings like ["November 2026", "Oktober 2026", ...]
 */
export function generatePeriodeList(count = 12, includeCurrentMonth = true): string[] {
  const periods: string[] = [];
  const now = new Date();
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  const startOffset = includeCurrentMonth ? 0 : 1;
  
  for (let i = startOffset; i < count + startOffset; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    periods.push(`${months[d.getMonth()]} ${d.getFullYear()}`);
  }
  
  return periods;
}
