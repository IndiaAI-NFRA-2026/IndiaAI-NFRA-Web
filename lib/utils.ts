import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { fieldLabelMap } from './utils/constants';
import { FinancialTableRow } from '@/types/documents';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatNumber = (value: string | undefined): string => {
  if (!value || value === '' || value === '0') return '';
  const num = Number.parseFloat(value);
  if (Number.isNaN(num)) return '';
  return num.toLocaleString('en-US');
};

const extractConfidence = (fieldData: any): number | undefined => {
  if ('confidence_score' in fieldData && fieldData.confidence_score) {
    const scoreValue =
      typeof fieldData.confidence_score === 'string' ? Number.parseFloat(fieldData.confidence_score) : fieldData.confidence_score;
    return Number.isNaN(scoreValue) ? undefined : scoreValue;
  }

  if ('confidence' in fieldData) {
    if (typeof fieldData.confidence === 'number') {
      return fieldData.confidence;
    }
    if (typeof fieldData.confidence === 'string') {
      const scoreValue = Number.parseFloat(fieldData.confidence);
      return Number.isNaN(scoreValue) ? undefined : scoreValue;
    }
  }

  return undefined;
};

const extractFieldData = (fieldData: any): { amount: string; confidence: number | undefined } => {
  if (!fieldData) {
    return { amount: '', confidence: undefined };
  }

  if (typeof fieldData === 'object' && 'value' in fieldData) {
    return {
      amount: fieldData.value || '',
      confidence: extractConfidence(fieldData),
    };
  }

  if (typeof fieldData === 'string') {
    return { amount: fieldData, confidence: undefined };
  }

  return { amount: '', confidence: undefined };
};

export const transformFieldToRow = (field: string, extractedData: any): FinancialTableRow => {
  const fieldInfo = fieldLabelMap[field];
  if (!fieldInfo) {
    return {
      category: field,
      amount: '',
    };
  }

  const fieldData = extractedData[field] || extractedData[fieldInfo.fieldKey];
  const { amount, confidence } = extractFieldData(fieldData);

  return {
    category: fieldInfo.label,
    fieldKey: fieldInfo.fieldKey,
    amount: amount,
    confidence: confidence,
  };
};

/**
 * Map API field names to translation keys for user-friendly field names
 */
const fieldNameMap: Record<string, string> = {
  // Institution fields
  name: 'institution.basicInformation.fullName',
  short_name: 'institution.basicInformation.shortName',
  primary_email: 'institution.contactInformation.email',
  primary_phone: 'institution.contactInformation.phone',
  address: 'institution.address.streetAddress',
  city: 'institution.address.city',
  postal_code: 'institution.address.postalCode',
  country: 'institution.address.country',
  tax: 'institution.taxInformation.taxId',
  default_language: 'institution.defaultSettings.language',
  default_currency: 'institution.defaultSettings.currency',
  default_timezone: 'institution.defaultSettings.timezone',
};

/**
 * Extract field name from error message and get user-friendly name
 */
function getFieldName(errorMessage: string, t: (key: string) => string): string | null {
  // Try to match patterns like "body.field_name:" or "field_name:"
  const fieldRegex = /(?:body\.)?(\w+):/i;
  const fieldMatch = fieldRegex.exec(errorMessage);
  if (!fieldMatch) return null;

  const apiFieldName = fieldMatch[1];
  const translationKey = fieldNameMap[apiFieldName];

  if (translationKey) {
    const translatedName = t(translationKey);
    // If translation exists (not the same as key), return it
    if (translatedName !== translationKey) {
      return translatedName;
    }
  }

  return null;
}

/**
 * Check if error message already has a formatted field name at the beginning
 * (e.g., "Primary Contact Phone: ..." vs "body.primary_phone: ...")
 */
function hasFormattedFieldName(errorMessage: string): boolean {
  // Check if it starts with a field name that contains spaces (formatted)
  // vs API field name (no spaces, like "body.field_name" or "field_name")
  const matchRegex = /^([^:]+):/;
  const match = matchRegex.exec(errorMessage);
  if (!match) return false;
  const prefix = match[1].trim();
  // If it contains spaces or doesn't match API field pattern, it's likely already formatted
  return prefix.includes(' ') || (!prefix.includes('.') && !/^[a-z_]+$/.test(prefix));
}

function formatEmailError(singleError: string, fieldName: string | null, t: (key: string) => string): string | null {
  if (!singleError.includes('primary_email') && !singleError.includes('email')) {
    return null;
  }

  if (singleError.includes('invalid characters') && singleError.includes('SPACE')) {
    return fieldName ? `${fieldName}: ${t('errors.email.containsSpace')}` : t('errors.email.containsSpace');
  }
  if (singleError.includes('not a valid email address')) {
    return fieldName ? `${fieldName}: ${t('errors.email.invalid')}` : t('errors.email.invalid');
  }
  if (singleError.includes('required')) {
    return fieldName ? `${fieldName}: ${t('errors.email.required')}` : t('errors.email.required');
  }
  return null;
}

function formatPhoneError(singleError: string, fieldName: string | null, t: (key: string) => string): string | null {
  if (!singleError.includes('primary_phone') && !singleError.includes('phone')) {
    return null;
  }

  if (singleError.includes('not a valid') || singleError.includes('invalid')) {
    return fieldName ? `${fieldName}: ${t('errors.phone.invalid')}` : t('errors.phone.invalid');
  }
  if (singleError.includes('required')) {
    return fieldName ? `${fieldName}: ${t('errors.phone.required')}` : t('errors.phone.required');
  }
  return null;
}

function formatRequiredError(singleError: string, fieldName: string | null, t: (key: string) => string): string {
  if (fieldName) {
    return `${fieldName}: ${t('errors.field.required')}`;
  }

  const fieldRegex = /body\.(\w+)/;
  const fieldMatch = fieldRegex.exec(singleError);
  if (fieldMatch) {
    const field = fieldMatch[1];
    const fieldKey = `errors.fields.${field}`;
    const translatedFieldName = t(fieldKey);
    if (translatedFieldName !== fieldKey) {
      return `${translatedFieldName}: ${t('errors.field.required')}`;
    }
  }

  return t('errors.fillRequiredFields');
}

function formatLengthError(cleanedMessage: string, fieldName: string | null): string {
  if (cleanedMessage.includes('should have at most') || cleanedMessage.includes('should have at least')) {
    return fieldName ? `${fieldName}: ${cleanedMessage}` : cleanedMessage;
  }
  return '';
}

function formatLongErrorMessage(cleanedMessage: string, fieldName: string | null, t: (key: string) => string): string {
  if (cleanedMessage.includes('invalid') || cleanedMessage.includes('not a valid')) {
    return fieldName ? `${fieldName}: ${t('errors.field.invalid')}` : t('errors.field.invalid');
  }

  const firstSentence = cleanedMessage.split('.')[0];
  const truncatedMessage = firstSentence.length <= 80 ? firstSentence : cleanedMessage.substring(0, 80) + '...';
  return fieldName ? `${fieldName}: ${truncatedMessage}` : truncatedMessage;
}

/**
 * Format a single error message
 * @param singleError - A single error message
 * @param t - Translation function from i18n
 */
function formatSingleErrorMessage(singleError: string, t: (key: string) => string): string {
  if (!singleError) return '';

  if (hasFormattedFieldName(singleError)) {
    return singleError;
  }

  const fieldName = getFieldName(singleError, t);

  const emailError = formatEmailError(singleError, fieldName, t);
  if (emailError) return emailError;

  const phoneError = formatPhoneError(singleError, fieldName, t);
  if (phoneError) return phoneError;

  if (singleError.includes('required')) {
    return formatRequiredError(singleError, fieldName, t);
  }

  const cleanedMessage = singleError.replace(/^(?:body\.)?\w+:\s*/i, '');

  const lengthError = formatLengthError(cleanedMessage, fieldName);
  if (lengthError) return lengthError;

  if (cleanedMessage.length > 100) {
    return formatLongErrorMessage(cleanedMessage, fieldName, t);
  }

  return fieldName ? `${fieldName}: ${cleanedMessage}` : cleanedMessage;
}

/**
 * Format API error messages to be more user-friendly
 * Converts technical validation errors to readable messages
 * Handles multiple errors separated by semicolons
 * @param errorMessage - The raw error message from API
 * @param t - Translation function from i18n
 */
export function formatErrorMessage(errorMessage: string, t: (key: string) => string): string {
  if (!errorMessage) return t('errors.generic');

  // Check if there are multiple errors separated by semicolons
  if (errorMessage.includes(';')) {
    const errors = errorMessage
      .split(';')
      .map((err) => err.trim())
      .filter((err) => err.length > 0);
    const formattedErrors = errors.map((err) => formatSingleErrorMessage(err, t)).filter((err) => err.length > 0);
    return formattedErrors.join('; ');
  }

  // Single error - use the single error formatter
  return formatSingleErrorMessage(errorMessage, t);
}
