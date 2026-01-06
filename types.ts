
export enum RecordStatus {
  VALID = 'VALID',
  INVALID = 'INVALID',
  WARNING = 'WARNING'
}

export enum TagType {
  FCOD = 'fcod',
  FTXT = 'ftxt',
  FURI = 'furi',
  FVAL = 'fval',
  UNKNOWN = 'UNKNOWN',
  NONE = 'NONE'
}

export interface ParsedRecord {
  raw: string;
  status: RecordStatus;
  errors: string[];
  version: string | null;
  tag: TagType;
  value: string | any | null;
  interpretation?: string;
}
