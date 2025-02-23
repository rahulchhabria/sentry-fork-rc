import {LightWeightOrganization} from 'app/types';
import {assert} from 'app/types/utils';

export type Sort = {
  kind: 'asc' | 'desc';
  field: string;
};

// Contains the URL field value & the related table column width.
// Can be parsed into a Column using explodeField()
export type Field = {
  field: string;
  width?: number;
};

export type ColumnType =
  | 'boolean'
  | 'date'
  | 'duration'
  | 'integer'
  | 'number'
  | 'percentage'
  | 'string';

export type ColumnValueType = ColumnType | 'never'; // Matches to nothing

type ValidateColumnValueFunction = ({name: string, dataType: ColumnType}) => boolean;

export type ValidateColumnTypes = ColumnType[] | ValidateColumnValueFunction;

export type AggregateParameter =
  | {
      kind: 'column';
      columnTypes: Readonly<ValidateColumnTypes>;
      defaultValue?: string;
      required: boolean;
    }
  | {
      kind: 'value';
      dataType: ColumnType;
      defaultValue?: string;
      required: boolean;
    };

export type AggregationRefinement = string | undefined;

// The parsed result of a Field.
// Functions and Fields are handled as subtypes to enable other
// code to work more simply.
// This type can be converted into a Field.field using generateFieldAsString()
export type QueryFieldValue =
  | {
      kind: 'field';
      field: string;
    }
  | {
      kind: 'function';
      function: [AggregationKey, string, AggregationRefinement];
    };

// Column is just an alias of a Query value
export type Column = QueryFieldValue;

export type Alignments = 'left' | 'right';

// Refer to src/sentry/api/event_search.py
export const AGGREGATIONS = {
  count: {
    parameters: [],
    outputType: 'number',
    isSortable: true,
    multiPlotType: 'area',
  },
  count_unique: {
    parameters: [
      {
        kind: 'column',
        columnTypes: ['string', 'integer', 'number', 'duration', 'date', 'boolean'],
        required: true,
      },
    ],
    outputType: 'number',
    isSortable: true,
    multiPlotType: 'line',
  },
  failure_count: {
    parameters: [],
    outputType: 'number',
    isSortable: true,
    multiPlotType: 'line',
  },
  min: {
    parameters: [
      {
        kind: 'column',
        columnTypes: validateForNumericAggregate([
          'integer',
          'number',
          'duration',
          'date',
        ]),
        required: true,
      },
    ],
    outputType: null,
    isSortable: true,
    multiPlotType: 'line',
  },
  max: {
    parameters: [
      {
        kind: 'column',
        columnTypes: validateForNumericAggregate([
          'integer',
          'number',
          'duration',
          'date',
        ]),
        required: true,
      },
    ],
    outputType: null,
    isSortable: true,
    multiPlotType: 'line',
  },
  avg: {
    parameters: [
      {
        kind: 'column',
        columnTypes: validateForNumericAggregate(['duration', 'number']),
        defaultValue: 'transaction.duration',
        required: true,
      },
    ],
    outputType: null,
    isSortable: true,
    multiPlotType: 'line',
  },
  sum: {
    parameters: [
      {
        kind: 'column',
        columnTypes: validateForNumericAggregate(['duration', 'number']),
        required: true,
      },
    ],
    outputType: null,
    isSortable: true,
    multiPlotType: 'area',
  },
  any: {
    parameters: [
      {
        kind: 'column',
        columnTypes: ['string', 'integer', 'number', 'duration', 'date', 'boolean'],
        required: true,
      },
    ],
    outputType: null,
    isSortable: true,
  },
  last_seen: {
    parameters: [],
    outputType: 'date',
    isSortable: true,
  },

  // Tracing functions.
  p50: {
    parameters: [
      {
        kind: 'column',
        columnTypes: validateForNumericAggregate(['duration', 'number']),
        defaultValue: 'transaction.duration',
        required: false,
      },
    ],
    outputType: null,
    isSortable: true,
    multiPlotType: 'line',
  },
  p75: {
    parameters: [
      {
        kind: 'column',
        columnTypes: validateForNumericAggregate(['duration', 'number']),
        defaultValue: 'transaction.duration',
        required: false,
      },
    ],
    outputType: null,
    isSortable: true,
    multiPlotType: 'line',
  },
  p95: {
    parameters: [
      {
        kind: 'column',
        columnTypes: validateForNumericAggregate(['duration', 'number']),
        defaultValue: 'transaction.duration',
        required: false,
      },
    ],
    outputType: null,
    type: [],
    isSortable: true,
    multiPlotType: 'line',
  },
  p99: {
    parameters: [
      {
        kind: 'column',
        columnTypes: validateForNumericAggregate(['duration', 'number']),
        defaultValue: 'transaction.duration',
        required: false,
      },
    ],
    outputType: null,
    isSortable: true,
    multiPlotType: 'line',
  },
  p100: {
    parameters: [
      {
        kind: 'column',
        columnTypes: validateForNumericAggregate(['duration', 'number']),
        defaultValue: 'transaction.duration',
        required: false,
      },
    ],
    outputType: null,
    isSortable: true,
    multiPlotType: 'line',
  },
  percentile: {
    parameters: [
      {
        kind: 'column',
        columnTypes: validateForNumericAggregate(['duration', 'number']),
        defaultValue: 'transaction.duration',
        required: true,
      },
      {
        kind: 'value',
        dataType: 'number',
        defaultValue: '0.5',
        required: true,
      },
    ],
    outputType: null,
    isSortable: true,
    multiPlotType: 'line',
  },
  failure_rate: {
    parameters: [],
    outputType: 'percentage',
    isSortable: true,
    multiPlotType: 'line',
  },
  apdex: {
    generateDefaultValue({parameter, organization}: DefaultValueInputs) {
      return organization.apdexThreshold?.toString() ?? parameter.defaultValue;
    },
    parameters: [
      {
        kind: 'value',
        dataType: 'number',
        defaultValue: '300',
        required: true,
      },
    ],
    outputType: 'number',
    isSortable: true,
    multiPlotType: 'line',
  },
  user_misery: {
    generateDefaultValue({parameter, organization}: DefaultValueInputs) {
      return organization.apdexThreshold?.toString() ?? parameter.defaultValue;
    },
    parameters: [
      {
        kind: 'value',
        dataType: 'number',
        defaultValue: '300',
        required: true,
      },
    ],
    outputType: 'number',
    isSortable: false,
    multiPlotType: 'area',
  },
  eps: {
    parameters: [],
    outputType: 'number',
    isSortable: true,
    multiPlotType: 'area',
  },
  epm: {
    parameters: [],
    outputType: 'number',
    isSortable: true,
    multiPlotType: 'area',
  },
  count_miserable: {
    generateDefaultValue({parameter, organization}: DefaultValueInputs) {
      if (parameter.kind === 'column') {
        return 'user';
      }
      return organization.apdexThreshold?.toString() ?? parameter.defaultValue;
    },
    parameters: [
      {
        kind: 'column',
        columnTypes: validateAllowedColumns(['user']),
        defaultValue: 'user',
        required: true,
      },
      {
        kind: 'value',
        dataType: 'number',
        defaultValue: '300',
        required: true,
      },
    ],
    outputType: 'number',
    isSortable: true,
    multiPlotType: 'area',
  },
} as const;

// TPM and TPS are aliases that are only used in Performance
export const ALIASES = {
  tpm: 'epm',
  tps: 'eps',
};

assert(AGGREGATIONS as Readonly<{[key in keyof typeof AGGREGATIONS]: Aggregation}>);

export type AggregationKey = keyof typeof AGGREGATIONS | keyof typeof ALIASES | '';

export type AggregationOutputType = Extract<
  ColumnType,
  'number' | 'integer' | 'date' | 'duration' | 'percentage' | 'string'
>;

export type PlotType = 'bar' | 'line' | 'area';

type DefaultValueInputs = {
  parameter: AggregateParameter;
  organization: LightWeightOrganization;
};

export type Aggregation = {
  /**
   * Used by functions that need to define their default values dynamically
   * based on the organization, or parameter data.
   */
  generateDefaultValue?: (data: DefaultValueInputs) => string;
  /**
   * List of parameters for the function.
   */
  parameters: Readonly<AggregateParameter[]>;
  /**
   * The output type. Null means to inherit from the field.
   */
  outputType: AggregationOutputType | null;
  /**
   * Can this function be used in a sort result
   */
  isSortable: boolean;
  /**
   * How this function should be plotted when shown in a multiseries result (top5)
   * Optional because some functions cannot be plotted (strings/dates)
   */
  multiPlotType?: PlotType;
};

enum FieldKey {
  CULPRIT = 'culprit',
  DEVICE_ARCH = 'device.arch',
  DEVICE_BATTERY_LEVEL = 'device.battery_level',
  DEVICE_BRAND = 'device.brand',
  DEVICE_CHARGING = 'device.charging',
  DEVICE_LOCALE = 'device.locale',
  DEVICE_NAME = 'device.name',
  DEVICE_ONLINE = 'device.online',
  DEVICE_ORIENTATION = 'device.orientation',
  DEVICE_SIMULATOR = 'device.simulator',
  DEVICE_UUID = 'device.uuid',
  DIST = 'dist',
  ENVIRONMENT = 'environment',
  ERROR_HANDLED = 'error.handled',
  ERROR_UNHANDLED = 'error.unhandled',
  ERROR_MECHANISM = 'error.mechanism',
  ERROR_TYPE = 'error.type',
  ERROR_VALUE = 'error.value',
  EVENT_TYPE = 'event.type',
  GEO_CITY = 'geo.city',
  GEO_COUNTRY_CODE = 'geo.country_code',
  GEO_REGION = 'geo.region',
  HTTP_METHOD = 'http.method',
  HTTP_REFERER = 'http.referer',
  HTTP_URL = 'http.url',
  ID = 'id',
  ISSUE = 'issue',
  LOCATION = 'location',
  MESSAGE = 'message',
  OS_BUILD = 'os.build',
  OS_KERNEL_VERSION = 'os.kernel_version',
  PLATFORM_NAME = 'platform.name',
  PROJECT = 'project',
  RELEASE = 'release',
  SDK_NAME = 'sdk.name',
  SDK_VERSION = 'sdk.version',
  STACK_ABS_PATH = 'stack.abs_path',
  STACK_COLNO = 'stack.colno',
  STACK_FILENAME = 'stack.filename',
  STACK_FUNCTION = 'stack.function',
  STACK_IN_APP = 'stack.in_app',
  STACK_LINENO = 'stack.lineno',
  STACK_MODULE = 'stack.module',
  STACK_PACKAGE = 'stack.package',
  STACK_STACK_LEVEL = 'stack.stack_level',
  TIMESTAMP = 'timestamp',
  TIMESTAMP_TO_HOUR = 'timestamp.to_hour',
  TIMESTAMP_TO_DAY = 'timestamp.to_day',
  TITLE = 'title',
  TRACE = 'trace',
  TRACE_PARENT_SPAN = 'trace.parent_span',
  TRACE_SPAN = 'trace.span',
  TRANSACTION = 'transaction',
  TRANSACTION_DURATION = 'transaction.duration',
  TRANSACTION_OP = 'transaction.op',
  TRANSACTION_STATUS = 'transaction.status',
  USER_EMAIL = 'user.email',
  USER_ID = 'user.id',
  USER_IP = 'user.ip',
  USER_USERNAME = 'user.username',
  USER_DISPLAY = 'user.display',
}

/**
 * Refer to src/sentry/snuba/events.py, search for Columns
 */
export const FIELDS: Readonly<Record<FieldKey, ColumnType>> = {
  [FieldKey.ID]: 'string',
  // issue.id and project.id are omitted on purpose.
  // Customers should use `issue` and `project` instead.
  [FieldKey.TIMESTAMP]: 'date',
  // time is omitted on purpose.
  // Customers should use `timestamp` or `timestamp.to_hour`.
  [FieldKey.TIMESTAMP_TO_HOUR]: 'date',
  [FieldKey.TIMESTAMP_TO_DAY]: 'date',

  [FieldKey.CULPRIT]: 'string',
  [FieldKey.LOCATION]: 'string',
  [FieldKey.MESSAGE]: 'string',
  [FieldKey.PLATFORM_NAME]: 'string',
  [FieldKey.ENVIRONMENT]: 'string',
  [FieldKey.RELEASE]: 'string',
  [FieldKey.DIST]: 'string',
  [FieldKey.TITLE]: 'string',
  [FieldKey.EVENT_TYPE]: 'string',
  // tags.key and tags.value are omitted on purpose as well.

  [FieldKey.TRANSACTION]: 'string',
  [FieldKey.USER_ID]: 'string',
  [FieldKey.USER_EMAIL]: 'string',
  [FieldKey.USER_USERNAME]: 'string',
  [FieldKey.USER_IP]: 'string',
  [FieldKey.SDK_NAME]: 'string',
  [FieldKey.SDK_VERSION]: 'string',
  [FieldKey.HTTP_METHOD]: 'string',
  [FieldKey.HTTP_REFERER]: 'string',
  [FieldKey.HTTP_URL]: 'string',
  [FieldKey.OS_BUILD]: 'string',
  [FieldKey.OS_KERNEL_VERSION]: 'string',
  [FieldKey.DEVICE_NAME]: 'string',
  [FieldKey.DEVICE_BRAND]: 'string',
  [FieldKey.DEVICE_LOCALE]: 'string',
  [FieldKey.DEVICE_UUID]: 'string',
  [FieldKey.DEVICE_ARCH]: 'string',
  [FieldKey.DEVICE_BATTERY_LEVEL]: 'number',
  [FieldKey.DEVICE_ORIENTATION]: 'string',
  [FieldKey.DEVICE_SIMULATOR]: 'boolean',
  [FieldKey.DEVICE_ONLINE]: 'boolean',
  [FieldKey.DEVICE_CHARGING]: 'boolean',
  [FieldKey.GEO_COUNTRY_CODE]: 'string',
  [FieldKey.GEO_REGION]: 'string',
  [FieldKey.GEO_CITY]: 'string',
  [FieldKey.ERROR_TYPE]: 'string',
  [FieldKey.ERROR_VALUE]: 'string',
  [FieldKey.ERROR_MECHANISM]: 'string',
  [FieldKey.ERROR_HANDLED]: 'boolean',
  [FieldKey.ERROR_UNHANDLED]: 'boolean',
  [FieldKey.STACK_ABS_PATH]: 'string',
  [FieldKey.STACK_FILENAME]: 'string',
  [FieldKey.STACK_PACKAGE]: 'string',
  [FieldKey.STACK_MODULE]: 'string',
  [FieldKey.STACK_FUNCTION]: 'string',
  [FieldKey.STACK_IN_APP]: 'boolean',
  [FieldKey.STACK_COLNO]: 'number',
  [FieldKey.STACK_LINENO]: 'number',
  [FieldKey.STACK_STACK_LEVEL]: 'number',
  // contexts.key and contexts.value omitted on purpose.

  // Transaction event fields.
  [FieldKey.TRANSACTION_DURATION]: 'duration',
  [FieldKey.TRANSACTION_OP]: 'string',
  [FieldKey.TRANSACTION_STATUS]: 'string',

  [FieldKey.TRACE]: 'string',
  [FieldKey.TRACE_SPAN]: 'string',
  [FieldKey.TRACE_PARENT_SPAN]: 'string',

  // Field alises defined in src/sentry/api/event_search.py
  [FieldKey.PROJECT]: 'string',
  [FieldKey.ISSUE]: 'string',
  [FieldKey.USER_DISPLAY]: 'string',
};

export type FieldTag = {
  key: FieldKey;
  name: FieldKey;
};

export const FIELD_TAGS = Object.freeze(
  Object.fromEntries(Object.keys(FIELDS).map(item => [item, {key: item, name: item}]))
);

// Allows for a less strict field key definition in cases we are returning custom strings as fields
export type LooseFieldKey = FieldKey | string | '';

export enum WebVital {
  FP = 'measurements.fp',
  FCP = 'measurements.fcp',
  LCP = 'measurements.lcp',
  FID = 'measurements.fid',
  CLS = 'measurements.cls',
  TTFB = 'measurements.ttfb',
  RequestTime = 'measurements.ttfb.requesttime',
}

const MEASUREMENTS: Readonly<Record<WebVital, ColumnType>> = {
  [WebVital.FP]: 'duration',
  [WebVital.FCP]: 'duration',
  [WebVital.LCP]: 'duration',
  [WebVital.FID]: 'duration',
  [WebVital.CLS]: 'number',
  [WebVital.TTFB]: 'duration',
  [WebVital.RequestTime]: 'duration',
};

// This list contains fields/functions that are available with performance-view feature.
export const TRACING_FIELDS = [
  'avg',
  'sum',
  'transaction.duration',
  'transaction.op',
  'transaction.status',
  'p50',
  'p75',
  'p95',
  'p99',
  'p100',
  'percentile',
  'failure_rate',
  'apdex',
  'user_misery',
  'user_misery_prototype',
  'count_miserable',
  'eps',
  'epm',
  ...Object.keys(MEASUREMENTS),
];

export const MEASUREMENT_PATTERN = /^measurements\.([a-zA-Z0-9-_.]+)$/;

export function isMeasurement(field: string): boolean {
  const results = field.match(MEASUREMENT_PATTERN);
  return !!results;
}

export function measurementType(field: string) {
  if (MEASUREMENTS.hasOwnProperty(field)) {
    return MEASUREMENTS[field];
  }
  return 'number';
}

export function getMeasurementSlug(field: string): string | null {
  const results = field.match(MEASUREMENT_PATTERN);
  if (results && results.length >= 2) {
    return results[1];
  }
  return null;
}

const AGGREGATE_PATTERN = /^([^\(]+)\((.*?)(?:\s*,\s*(.*))?\)$/;

export function getAggregateArg(field: string): string | null {
  const results = field.match(AGGREGATE_PATTERN);
  if (results && results.length >= 3) {
    return results[2];
  }
  return null;
}

export function generateAggregateFields(
  organization: LightWeightOrganization,
  eventFields: readonly Field[] | Field[],
  excludeFields: readonly string[] = []
): Field[] {
  const functions = Object.keys(AGGREGATIONS);
  const fields = Object.values(eventFields).map(field => field.field);
  functions.forEach(func => {
    const parameters = AGGREGATIONS[func].parameters.map(param => {
      const generator = AGGREGATIONS[func].generateDefaultValue;
      if (typeof generator === 'undefined') {
        return param;
      }
      return {
        ...param,
        defaultValue: generator({parameter: param, organization}),
      };
    });

    if (parameters.every(param => typeof param.defaultValue !== 'undefined')) {
      const newField = `${func}(${parameters
        .map(param => param.defaultValue)
        .join(',')})`;
      if (fields.indexOf(newField) === -1 && excludeFields.indexOf(newField) === -1) {
        fields.push(newField);
      }
    }
  });
  return fields.map(field => ({field})) as Field[];
}

export function explodeFieldString(field: string): Column {
  const results = field.match(AGGREGATE_PATTERN);

  if (results && results.length >= 3) {
    return {
      kind: 'function',
      function: [
        results[1] as AggregationKey,
        results[2],
        results[3] as AggregationRefinement,
      ],
    };
  }

  return {kind: 'field', field};
}

export function generateFieldAsString(value: QueryFieldValue): string {
  if (value.kind === 'field') {
    return value.field;
  }

  const aggregation = value.function[0];
  const parameters = value.function.slice(1).filter(i => i);
  return `${aggregation}(${parameters.join(',')})`;
}

export function explodeField(field: Field): Column {
  const results = explodeFieldString(field.field);

  return results;
}

/**
 * Get the alias that the API results will have for a given aggregate function name
 */
export function getAggregateAlias(field: string): string {
  if (!field.match(AGGREGATE_PATTERN)) {
    return field;
  }
  return field
    .replace(AGGREGATE_PATTERN, '$1_$2_$3')
    .replace(/[^\w]/g, '_')
    .replace(/^_+/g, '')
    .replace(/_+$/, '');
}

/**
 * Check if a field name looks like an aggregate function or known aggregate alias.
 */
export function isAggregateField(field: string): boolean {
  return field.match(AGGREGATE_PATTERN) !== null;
}

/**
 * Convert a function string into type it will output.
 * This is useful when you need to format values in tooltips,
 * or in series markers.
 */
export function aggregateOutputType(field: string): AggregationOutputType {
  const matches = AGGREGATE_PATTERN.exec(field);
  if (!matches) {
    return 'number';
  }
  const outputType = aggregateFunctionOutputType(matches[1], matches[2]);
  if (outputType === null) {
    return 'number';
  }
  return outputType;
}

/**
 * Converts a function string and its first argument into its output type.
 * - If the function has a fixed output type, that will be the result.
 * - If the function does not define an output type, the output type will be equal to
 *   the type of its first argument.
 * - If the function has an optional first argument, and it was not defined, make sure
 *   to use the default argument as the first argument.
 * - If the type could not be determined, return null.
 */
export function aggregateFunctionOutputType(
  funcName: string,
  firstArg: string | undefined
): AggregationOutputType | null {
  const aggregate = AGGREGATIONS[ALIASES[funcName] || funcName];

  // Attempt to use the function's outputType.
  if (aggregate?.outputType) {
    return aggregate.outputType;
  }

  // If the first argument is undefined and it is not required,
  // then we attempt to get the default value.
  if (!firstArg && aggregate?.parameters?.[0]) {
    if (aggregate.parameters[0].required === false) {
      firstArg = aggregate.parameters[0].defaultValue;
    }
  }

  // If the function is an inherit type it will have a field as
  // the first parameter and we can use that to get the type.
  if (firstArg && FIELDS.hasOwnProperty(firstArg)) {
    return FIELDS[firstArg];
  } else if (firstArg && isMeasurement(firstArg)) {
    return measurementType(firstArg);
  }

  return null;
}

/**
 * Get the multi-series chart type for an aggregate function.
 */
export function aggregateMultiPlotType(field: string): PlotType {
  const matches = AGGREGATE_PATTERN.exec(field);
  // Handle invalid data.
  if (!matches) {
    return 'area';
  }
  const funcName = matches[1];
  if (!AGGREGATIONS.hasOwnProperty(funcName)) {
    return 'area';
  }
  return AGGREGATIONS[funcName].multiPlotType;
}

function validateForNumericAggregate(
  validColumnTypes: ColumnType[]
): ValidateColumnValueFunction {
  return function ({name, dataType}: {name: string; dataType: ColumnType}): boolean {
    // these built-in columns cannot be applied to numeric aggregates such as percentile(...)
    if (
      [
        FieldKey.DEVICE_BATTERY_LEVEL,
        FieldKey.STACK_COLNO,
        FieldKey.STACK_LINENO,
        FieldKey.STACK_STACK_LEVEL,
      ].includes(name as FieldKey)
    ) {
      return false;
    }

    return validColumnTypes.includes(dataType);
  };
}

function validateAllowedColumns(validColumns: string[]): ValidateColumnValueFunction {
  return function ({name}): boolean {
    return validColumns.includes(name);
  };
}

const alignedTypes: ColumnValueType[] = ['number', 'duration', 'integer', 'percentage'];

export function fieldAlignment(
  columnName: string,
  columnType?: undefined | ColumnValueType,
  metadata?: Record<string, ColumnValueType>
): Alignments {
  let align: Alignments = 'left';
  if (columnType) {
    align = alignedTypes.includes(columnType) ? 'right' : 'left';
  }
  if (columnType === undefined || columnType === 'never') {
    // fallback to align the column based on the table metadata
    const maybeType = metadata ? metadata[getAggregateAlias(columnName)] : undefined;

    if (maybeType !== undefined && alignedTypes.includes(maybeType)) {
      align = 'right';
    }
  }
  return align;
}
