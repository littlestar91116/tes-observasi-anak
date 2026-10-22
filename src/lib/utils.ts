/**
 * Utility functions for Little Star School Pamekasan
 */

/**
 * Calculate precise child age in Indonesian (e.g. "5 tahun 3 bulan")
 */
export function calculateAgeIndonesian(birthDateString: string): string {
  if (!birthDateString) return '';
  const birthDate = new Date(birthDateString);
  const today = new Date();

  if (isNaN(birthDate.getTime()) || birthDate > today) {
    return 'Tanggal tidak valid';
  }

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years === 0) {
    return `${Math.max(1, months)} bulan`;
  }
  if (months === 0) {
    return `${years} tahun`;
  }
  return `${years} tahun ${months} bulan`;
}

/**
 * Format date in Indonesian locale (e.g. "Senin, 26 Oktober 2026")
 */
export function formatIndonesianDate(dateString: string, withTime = false): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    if (withTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }

    return new Intl.DateTimeFormat('id-ID', options).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Format simple short date (e.g. "26 Okt 2026")
 */
export function formatShortDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Generate unique registration number: LSS-YYYY-XXXX
 */
export function generateRegistrationNumber(counter: number): string {
  const year = new Date().getFullYear();
  const sequence = String(counter).padStart(4, '0');
  return `LSS-${year}-${sequence}`;
}

/**
 * Generate formatted WhatsApp link with prefilled message
 */
export function createWhatsAppLink(phoneNumber: string, message: string): string {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}
