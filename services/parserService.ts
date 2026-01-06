import { RecordStatus, TagType } from '../types';
import type { ParsedRecord } from '../types';

const VERSION_TAG = 'v=FORSALE1;';

/**
 * Decodes a string containing `\DDD` decimal escape sequences into a UTF-8 string.
 * This is used to interpret non-ASCII characters in TXT records as per the draft.
 * @param input The raw string value from the TXT record.
 * @returns A string with escape sequences converted to characters.
 */
function decodeEscapedSequences(input: string): string {
    let result = '';
    let currentBytes: number[] = [];
    let i = 0;

    const flushBytes = () => {
        if (currentBytes.length > 0) {
            // Use fatal: false to gracefully handle invalid/incomplete UTF-8 sequences
            // by inserting replacement characters (�) instead of throwing an error.
            result += new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(currentBytes));
            currentBytes = [];
        }
    };

    while (i < input.length) {
        if (input[i] === '\\') {
            // Look for a sequence of 1 to 3 digits.
            const match = input.substring(i + 1).match(/^\d{1,3}/);
            if (match) {
                const byte = parseInt(match[0], 10);
                if (byte >= 0 && byte <= 255) {
                    currentBytes.push(byte);
                    i += 1 + match[0].length;
                    continue; // Continue to gather more bytes of a potential multi-byte char
                }
            }
        }

        // If we are here, it's not a valid \DDD escape sequence that we are parsing.
        // It's either a regular character or an escape we don't handle.
        // First, flush any byte sequence we have collected.
        flushBytes();
        
        // Then append the current character and move on.
        result += input[i];
        i++;
    }

    // Flush any remaining bytes at the end of the string.
    flushBytes();

    return result;
}


export function parseRecord(record: string): ParsedRecord {
  const result: ParsedRecord = {
    raw: record,
    status: RecordStatus.VALID,
    errors: [],
    version: null,
    tag: TagType.NONE,
    value: null
  };

  if (!record.startsWith(VERSION_TAG.slice(0, -1))) { // Check without trailing semicolon for flexibility
    result.status = RecordStatus.INVALID;
    result.errors.push(`Record must start with "v=FORSALE1"`);
    if(!record.startsWith('v=')){
        result.errors.push(`Unrecognized version tag. Expected "v=FORSALE1".`);
    }
    return result;
  }
  
  if (!record.startsWith(VERSION_TAG)) {
     result.status = RecordStatus.INVALID;
     result.errors.push(`Version tag "v=FORSALE1" should be followed by a semicolon ";".`);
  }


  result.version = 'FORSALE1';
  
  const contentPart = record.substring(VERSION_TAG.length).trim();

  if (!contentPart) {
    result.interpretation = "Indicates the domain is for sale without providing additional details.";
    return result;
  }
  
  const parts = contentPart.split('=');
  if (parts.length < 2) {
      result.status = RecordStatus.INVALID;
      result.errors.push(`Invalid tag-value format. Expected "tag=value", but got "${contentPart}".`);
      return result;
  }
  
  const tagName = parts[0];
  const tagValue = parts.slice(1).join('=');

  if (!tagValue) {
      result.status = RecordStatus.INVALID;
      result.errors.push(`The value for tag "${tagName}" cannot be empty.`);
  }

  switch (tagName) {
    case 'fcod':
      result.tag = TagType.FCOD;
      const decodedFcod = decodeEscapedSequences(tagValue);
      result.value = decodedFcod;
      result.interpretation = `Proprietary code for automated systems: ${decodedFcod}`;
      break;
    case 'ftxt':
      result.tag = TagType.FTXT;
      const decodedValue = decodeEscapedSequences(tagValue);
      result.value = decodedValue;
      result.interpretation = `Human-readable text: "${decodedValue}"`;
      break;
    case 'furi':
      result.tag = TagType.FURI;
      const decodedUri = decodeEscapedSequences(tagValue);
      result.value = decodedUri;
      try {
        const url = new URL(decodedUri);
        const recommendedSchemes = ['http:', 'https:', 'mailto:', 'tel:'];
        if (!recommendedSchemes.includes(url.protocol)) {
            result.status = RecordStatus.WARNING;
            result.errors.push(`URI scheme "${url.protocol}" is not one of the recommended schemes (http, https, mailto, tel).`);
        }
        result.interpretation = `Contact/info URI: ${decodedUri}`;
      } catch (e) {
        result.status = RecordStatus.INVALID;
        result.errors.push(`The value "${decodedUri}" is not a valid URI.`);
      }
      break;
    case 'fval':
      result.tag = TagType.FVAL;
      const decodedFval = decodeEscapedSequences(tagValue);
      // This regex will capture any non-numeric prefix as the currency part.
      const fvalRegex = /^([^0-9.]+)(\d+(\.\d+)?)$/;
      const match = decodedFval.match(fvalRegex);

      if (match) {
        const currency = match[1];
        const amount = parseFloat(match[2]);
        result.value = { currency, amount };
        result.interpretation = `Asking price: ${amount} ${currency}`;

        // Validate that the currency is a 3-letter uppercase code as per the draft.
        const currencyCodeRegex = /^[A-Z]{3}$/;
        if (!currencyCodeRegex.test(currency)) {
          result.status = RecordStatus.INVALID;
          result.errors.push(`Invalid currency format. Expected a 3-letter uppercase currency code (e.g., USD, EUR), but got "${currency}".`);
        }
      } else {
        result.status = RecordStatus.INVALID;
        // Update error message to be consistent with the validation rule.
        result.errors.push(`Invalid format for "fval". Expected a 3-letter currency code followed by a number (e.g., "USD1000.00").`);
      }
      break;
    default:
      result.tag = TagType.UNKNOWN;
      result.value = contentPart;
      result.status = RecordStatus.INVALID;
      result.errors.push(`Unrecognized content tag: "${tagName}".`);
  }
  
  if (result.errors.length > 0 && result.status === RecordStatus.VALID) {
      result.status = RecordStatus.WARNING;
  }

  return result;
}