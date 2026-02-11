import { DocumentStatus } from '@/enums';
import { MAX_INPUT_LENGTH } from './constants';
import { USER_ROLE } from '@/enums/auth';
import { DocumentType } from '@/enums/document-type';

export function formatDate(dateString: string | Date, time: boolean = true): string {
  if (!dateString) return '-';

  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');

    return time ? `${year}-${month}-${day} ${hour}:${minute}:${second}` : `${year}-${month}-${day}`;
  } catch {
    return '-';
  }
}

export function formatText(str: string): string {
  if (!str) return '-';

  return str
    .replaceAll('_', ' ')
    .toLowerCase()
    .replaceAll(/\b\w/g, (char) => char.toUpperCase());
}

export const isZipFile = (file: File): boolean => {
  const zipExtensions = ['.zip', '.rar', '.7z', '.tar', '.gz', '.tgz', '.tar.gz'];
  const fileName = file.name.toLowerCase();
  return zipExtensions.some((ext) => fileName.endsWith(ext));
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone?.trim()) {
    return false;
  }

  // Remove spaces, dashes, parentheses, and plus sign for validation
  const cleanedPhone = phone.replaceAll(/[\s()+-]/g, '');

  // Check if contains only digits after cleaning
  if (!/^\d+$/.test(cleanedPhone)) {
    return false;
  }

  // Phone number should be between 8-15 digits (ITU-T E.164 standard allows up to 15 digits)
  // Minimum 8 digits for most countries, maximum 15 digits including country code
  return cleanedPhone.length >= 8 && cleanedPhone.length <= 15;
};

export function formatDateString(str?: string): string {
  if (!str) return '-';

  const [day, month, year] = str.split('-');
  return `${day} ${month} ${year}`;
}

export function snakeToCamel(str: string): string {
  if (!str) return '';
  return str.toLowerCase().replaceAll(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export const parseNumberValue = (val: string): number | null => {
  if (!val) return null;
  const parsed = Number.parseFloat(val.replaceAll(',', ''));
  return Number.isNaN(parsed) ? null : parsed;
};

export const formatValue = (value: string | number) => {
  let num: number;

  if (typeof value === 'number') {
    num = value;
  } else if (value.includes('e+') || value.includes('e-')) {
    num = Number.parseFloat(value);
  } else {
    num = Number.parseFloat(value.replaceAll(',', ''));
  }

  if (Number.isNaN(num)) {
    return typeof value === 'string' ? value : String(value);
  }

  // Round to 2 decimal places
  num = Math.round(num * 100) / 100;

  // If rounded to 0, return "0"
  if (num === 0) {
    return '0';
  }

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  // Helper function to format number without trailing zeros, rounded to 2 decimal places
  const formatNumber = (n: number): string => {
    // Round to 2 decimal places
    const rounded = Math.round(n * 100) / 100;
    // Format with up to 2 decimal places
    const str = rounded.toFixed(2);
    // Remove trailing zeros and decimal point if not needed
    return str.includes('.') ? str.replaceAll(/\.?0+$/g, '') : str;
  };

  if (absNum >= 1e9) {
    const billions = absNum / 1e9;
    return `${sign}${formatNumber(billions)}B`;
  } else if (absNum >= 1e6) {
    const millions = absNum / 1e6;
    return `${sign}${formatNumber(millions)}M`;
  } else {
    return `${sign}${formatNumber(absNum)}`;
  }
};

export function formatTitle(name: string): string {
  return name
    ? name
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : '';
}

export function snakeToCamelCase(str: string): string {
  return str
    ? str
        .toLowerCase()
        .split('_')
        .map((word, index) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
        .join('')
    : '';
}

export function camelToSnake(str: string): string {
  if (!str) return '';
  return str
    .replaceAll(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, ''); // Remove leading underscore if present
}

export const normalizeFlag = (flag: string): string => {
  const flagMap: Record<string, string> = {
    casino: 'CASINO',
    unusual_currency: 'UNUSUAL-CURRENCY',
    non_usual_currency: 'UNUSUAL-CURRENCY',
    round_tripping: 'ROUND-TRIP',
    largest_value: 'LARGEST-VALUE',
    anomalies: 'ANOMALIES',
  };
  return flagMap[flag.toLowerCase()] || flag.toUpperCase();
};

export function formatCurrency(value: number): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '0';

  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 20,
  });

  return formatted.replaceAll(/\.0+$/g, '').replaceAll(/(\.\d*?[1-9])0+$/g, '$1');
}

/**
 * Filters input to only contain numeric characters (0-9)
 * Useful for phone numbers, postal codes, tax IDs, etc.
 * @param value - The input value to filter
 * @returns The filtered value containing only digits
 */
export const filterNumericInput = (value: string): string => {
  return value.replaceAll(/\D/g, '');
};

/**
 * Handles numeric input change event
 * Filters out non-numeric characters from the input
 * @param value - The input value from the event
 * @param onChange - The callback function to call with the filtered value
 */
export const handleNumericInputChange = (value: string, onChange: (value: string) => void): void => {
  const numericValue = filterNumericInput(value);
  onChange(numericValue);
};

/**
 * Prevents non-numeric key presses in input fields
 * Allows navigation keys, shortcuts (Ctrl+A, Ctrl+C, etc.), and numbers
 * @param e - Keyboard event from the input
 */
export const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
  // Allow: backspace, delete, tab, escape, enter, home, end, left arrow, right arrow
  const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End', 'ArrowLeft', 'ArrowRight'];
  if (allowedKeys.includes(e.key)) {
    return;
  }
  // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X (also Cmd on Mac)
  if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
    return;
  }
  // Ensure that it is a number (0-9 on main keyboard or numpad) and stop the keypress
  if (!/^\d$/.test(e.key)) {
    e.preventDefault();
  }
};

export const formatFieldPath = (field: string): string => {
  if (!field || typeof field !== 'string') {
    return field;
  }
  return field
    .replaceAll(/\[(\d+)\]/g, ' $1 ')
    .replaceAll('.', ' ')
    .replaceAll(/\s+/g, ' ')
    .trim();
};

export const formatFieldPathsInContent = (content: string): string => {
  if (!content || typeof content !== 'string') {
    return content;
  }
  const arrayIndexPattern = /(['"]?)(\w+(?:\[\d+\])+(?:\.\w+)+)\1/g;
  const nestedFieldPattern = /(['"]?)(\w+(?:\.\w+){2,})\1/g;

  let result = content.replaceAll(arrayIndexPattern, (match, quote, fieldPath) => {
    const formatted = formatFieldPath(fieldPath);
    return quote ? `${quote}${formatted}${quote}` : formatted;
  });

  result = result.replaceAll(nestedFieldPattern, (match, quote, fieldPath) => {
    const formatted = formatFieldPath(fieldPath);
    return quote ? `${quote}${formatted}${quote}` : formatted;
  });

  return result;
};

// Helper function to normalize minus sign position
const normalizeMinusSign = (value: string): string => {
  const minusIndex = value.indexOf('-');
  if (minusIndex > 0) {
    return value.replaceAll('-', '');
  }
  if (minusIndex === 0) {
    return '-' + value.slice(1).replaceAll('-', '');
  }
  return value;
};

// Helper function to process decimal point
const processDecimalPoint = (
  value: string,
  removeCommaFromDecimal: boolean
): { beforeDot: string; afterDot: string; hasDecimal: boolean; dotIndex: number } => {
  const firstDotIndex = value.indexOf('.');
  if (firstDotIndex === -1) {
    return { beforeDot: value, afterDot: '', hasDecimal: false, dotIndex: -1 };
  }

  const beforeDot = value.substring(0, firstDotIndex);
  let afterDot = value.substring(firstDotIndex + 1).replaceAll('.', '');

  if (removeCommaFromDecimal) {
    afterDot = afterDot.replaceAll(',', '');
  }

  return { beforeDot, afterDot, hasDecimal: true, dotIndex: firstDotIndex };
};

// Helper function to truncate value while preserving decimal point
const truncateWithDecimalPreservation = (beforeDot: string, afterDot: string, dotIndex: number, maxLength: number): string => {
  const dotLength = 1;
  const availableForBeforeDot = dotIndex;
  const availableForAfterDot = maxLength - dotIndex - dotLength;

  const truncatedBeforeDot = beforeDot.length > availableForBeforeDot ? beforeDot.substring(0, availableForBeforeDot) : beforeDot;

  if (availableForAfterDot <= 0) {
    return truncatedBeforeDot;
  }

  const truncatedAfterDot = afterDot.length > availableForAfterDot ? afterDot.substring(0, availableForAfterDot) : afterDot;
  return truncatedBeforeDot + '.' + truncatedAfterDot;
};

/**
 * Sanitizes numeric input allowing positive, negative, decimals, and comma as thousand separator
 * @param value - The input value to sanitize
 * @param maxLength - Maximum allowed length (default: 20)
 * @returns The sanitized value
 */
export const sanitizeNumericInput = (value: string, maxLength: number = MAX_INPUT_LENGTH): string => {
  if (!value) return '';

  // Remove all non-numeric characters except minus, decimal point, and comma
  let cleaned = value.replaceAll(/[^\d.,-]/g, '');
  cleaned = normalizeMinusSign(cleaned);

  const { beforeDot, afterDot, hasDecimal, dotIndex } = processDecimalPoint(cleaned, true);

  if (hasDecimal) {
    cleaned = beforeDot + '.' + afterDot;
  } else {
    cleaned = beforeDot;
  }

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  if (hasDecimal && dotIndex < maxLength) {
    return truncateWithDecimalPreservation(beforeDot, afterDot, dotIndex, maxLength);
  }

  return cleaned.substring(0, maxLength);
};

/**
 * Sanitizes numeric input allowing only numbers, no commas - used for credit and balance fields
 * @param value - The input value to sanitize
 * @param maxLength - Maximum allowed length (default: 20)
 * @returns The sanitized value
 */
export const sanitizeNumericInputNoComma = (value: string, maxLength: number = MAX_INPUT_LENGTH): string => {
  if (!value) return '';

  // Remove all non-numeric characters except minus and decimal point (no comma)
  let cleaned = value.replaceAll(/[^\d.-]/g, '');
  cleaned = normalizeMinusSign(cleaned);

  const { beforeDot, afterDot, hasDecimal, dotIndex } = processDecimalPoint(cleaned, false);

  if (hasDecimal) {
    cleaned = beforeDot + '.' + afterDot;
  } else {
    cleaned = beforeDot;
  }

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  if (hasDecimal && dotIndex < maxLength) {
    return truncateWithDecimalPreservation(beforeDot, afterDot, dotIndex, maxLength);
  }

  return cleaned.substring(0, maxLength);
};

export const getUserRoleLabel = (role: USER_ROLE): string => {
  switch (role) {
    case USER_ROLE.ADMIN:
      return 'Administrator';
    case USER_ROLE.CREDIT_OFFICER_ANALYST:
      return 'Credit Officer Analyst';
    case USER_ROLE.COMPLIANCE_OFFICER:
      return 'Compliance Officer';
    default:
      return role;
  }
};

export const getTagSeverity = (status: string | undefined | null): 'info' | 'warn' | 'danger' | 'success' | 'contrast' => {
  const normalized = String(status ?? '').toUpperCase();
  switch (normalized) {
    case DocumentStatus.PENDING.toUpperCase():
      return 'info';
    case DocumentStatus.PROCESSING.toUpperCase():
      return 'warn';
    case DocumentStatus.REVIEW.toUpperCase():
      return 'success';
    case DocumentStatus.FAILED.toUpperCase():
      return 'danger';
    case DocumentStatus.APPROVED.toUpperCase():
      return 'contrast';
    case 'medium'.toUpperCase():
      return 'warn';
    case 'weak'.toUpperCase():
      return 'danger';
    case 'strong'.toUpperCase():
      return 'success';
    case DocumentType.UPLOADED.toUpperCase():
      return 'info';
    case DocumentType.FINANCIAL_STATEMENT.toUpperCase():
      return 'warn';
    case DocumentType.BANK_STATEMENT.toUpperCase():
      return 'success';
    case DocumentType.CONSOLIDATED_ANALYZE.toUpperCase():
      return 'contrast';
    case DocumentType.COMBINED_ANALYZE.toUpperCase():
      return 'success';
    case DocumentType.FRAUD_DETECTION.toUpperCase():
      return 'danger';
    case USER_ROLE.ADMIN.toUpperCase():
      return 'success';
    case USER_ROLE.CREDIT_OFFICER_ANALYST.toUpperCase():
      return 'warn';
    case USER_ROLE.COMPLIANCE_OFFICER.toUpperCase():
      return 'contrast';
    default:
      return 'info';
  }
};
