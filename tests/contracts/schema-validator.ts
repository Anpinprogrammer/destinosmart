type JsonSchema = {
  type?: string | string[];
  required?: string[];
  additionalProperties?: boolean;
  properties?: Record<string, JsonSchema>;
  enum?: readonly unknown[];
  minimum?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_TIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function matchesType(value: unknown, type: string): boolean {
  if (type === 'null') return value === null;
  if (type === 'array') return Array.isArray(value);
  if (type === 'object') return typeof value === 'object' && value !== null && !Array.isArray(value);
  if (type === 'integer') return typeof value === 'number' && Number.isInteger(value);
  return typeof value === type;
}

function formatIsValid(value: string, format: string): boolean {
  if (format === 'email') return EMAIL_PATTERN.test(value);
  if (format === 'uuid') return UUID_PATTERN.test(value);
  if (format === 'date-time') {
    return DATE_TIME_PATTERN.test(value) && !Number.isNaN(Date.parse(value));
  }
  if (format === 'uri') {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }
  return true;
}

/**
 * Validador mínimo para el subconjunto de JSON Schema usado por
 * `profile.schema.json`. Evita añadir una dependencia no aprobada.
 */
export function validateJsonSchema(
  value: unknown,
  schema: JsonSchema,
  path = '$',
): string[] {
  const errors: string[] = [];
  const types =
    schema.type === undefined
      ? []
      : Array.isArray(schema.type)
        ? schema.type
        : [schema.type];

  if (types.length > 0 && !types.some((type) => matchesType(value, type))) {
    errors.push(`${path}: expected ${types.join('|')}`);
    return errors;
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${path}: not in enum`);
  }

  if (typeof value === 'string') {
    if (schema.maxLength !== undefined && [...value].length > schema.maxLength) {
      errors.push(`${path}: exceeds maxLength`);
    }
    if (schema.pattern && !new RegExp(schema.pattern, 'u').test(value)) {
      errors.push(`${path}: does not match pattern`);
    }
    if (schema.format && !formatIsValid(value, schema.format)) {
      errors.push(`${path}: invalid format ${schema.format}`);
    }
  }

  if (typeof value === 'number' && schema.minimum !== undefined && value < schema.minimum) {
    errors.push(`${path}: below minimum`);
  }

  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    for (const key of schema.required ?? []) {
      if (!(key in record)) {
        errors.push(`${path}.${key}: required`);
      }
    }
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(record)) {
        if (!(key in (schema.properties ?? {}))) {
          errors.push(`${path}.${key}: additional property`);
        }
      }
    }
    for (const [key, propertySchema] of Object.entries(schema.properties ?? {})) {
      if (key in record) {
        errors.push(...validateJsonSchema(record[key], propertySchema, `${path}.${key}`));
      }
    }
  }

  return errors;
}
