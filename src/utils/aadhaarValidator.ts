/**
 * Aadhaar and Identity Verification Utility
 * Features:
 * - Mathematical UIDAI Verhoeff Checksum Algorithm
 * - Strict Indian Mobile Number Validation (anti-fraud / anti-fake ID)
 * - UIDAI Compliant Privacy Masking (XXXX XXXX 1234)
 * - Auto-formatting for 12-digit input with spaces
 */

// Verhoeff multiplication table (d)
const d: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

// Verhoeff permutation table (p)
const p: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

/**
 * Format raw Aadhaar input into standard "XXXX XXXX XXXX" format
 */
export function formatAadhaar(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 12);
  const parts: string[] = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(' ');
}

/**
 * Mask Aadhaar number for UIDAI privacy compliance: "XXXX XXXX 1234"
 */
export function maskAadhaar(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 4) return 'XXXX XXXX XXXX';
  const last4 = digits.slice(-4);
  return `XXXX XXXX ${last4}`;
}

/**
 * Full UIDAI Aadhaar Number Validation using mathematical Verhoeff dihedral algorithm
 */
export function validateAadhaar(raw: string): { isValid: boolean; error?: string } {
  if (!raw || !raw.trim()) {
    return { isValid: false, error: 'Aadhaar Identification Number is required.' };
  }

  const clean = raw.replace(/[\s-]/g, '');

  if (clean.length !== 12) {
    return { isValid: false, error: 'Aadhaar must be exactly 12 digits (e.g. 3675 9834 6016).' };
  }

  if (!/^\d{12}$/.test(clean)) {
    return { isValid: false, error: 'Aadhaar must contain numbers only.' };
  }

  // UIDAI specification: Aadhaar cannot begin with 0 or 1
  if (/^[01]/.test(clean)) {
    return { isValid: false, error: 'Invalid Aadhaar: Government Aadhaar cannot begin with 0 or 1.' };
  }

  // Prevent repeated identical digits (e.g., 222222222222)
  if (/^(\d)\1{11}$/.test(clean)) {
    return { isValid: false, error: 'Invalid Aadhaar: Repeating digits are not permitted.' };
  }

  // Verhoeff Checksum calculation
  let c = 0;
  const reversed = clean.split('').reverse().map(Number);
  for (let i = 0; i < reversed.length; i++) {
    c = d[c][p[i % 8][reversed[i]]];
  }

  if (c !== 0) {
    return { isValid: false, error: 'Aadhaar verification failed: Checksum does not match UIDAI standards.' };
  }

  return { isValid: true };
}

/**
 * Strict Indian Mobile Number Validation
 * Prevents fake mobile IDs like 1234567890, 0000000000, 9999999999
 */
export function validateIndianMobile(raw: string): { isValid: boolean; cleanPhone?: string; error?: string } {
  if (!raw || !raw.trim()) {
    return { isValid: false, error: 'Mobile number is required.' };
  }

  let clean = raw.replace(/\D/g, '');

  // Strip international prefix if present
  if (clean.length === 12 && clean.startsWith('91')) {
    clean = clean.slice(2);
  } else if (clean.length === 11 && clean.startsWith('0')) {
    clean = clean.slice(1);
  }

  if (clean.length !== 10) {
    return { isValid: false, error: 'Mobile number must be exactly 10 digits.' };
  }

  // Must begin with 6, 7, 8, or 9
  if (!/^[6-9]\d{9}$/.test(clean)) {
    return { isValid: false, error: 'Invalid mobile: Valid Indian numbers must begin with 6, 7, 8, or 9.' };
  }

  // Block identical repeating digits (e.g. 9999999999, 8888888888)
  if (/^(\d)\1{9}$/.test(clean)) {
    return { isValid: false, error: 'Invalid mobile: Repeated dummy numbers are blocked.' };
  }

  // Block sequential fake dummy numbers
  if (clean === '1234567890' || clean === '9876543210' || clean === '0123456789') {
    return { isValid: false, error: 'Invalid dummy mobile number entered.' };
  }

  return { isValid: true, cleanPhone: clean };
}
