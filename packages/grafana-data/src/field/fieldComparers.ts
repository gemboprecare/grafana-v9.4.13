import { isNumber } from 'lodash';

import { dateTime, isDateTimeInput } from '../datetime';
import { Field, FieldType } from '../types/dataFrame';
import { Vector } from '../types/vector';

type IndexComparer = (a: number, b: number) => number;

/** @public */
export const fieldIndexComparer = (field: Field, reverse = false): IndexComparer => {
  const values = field.values;

  switch (field.type) {
    case FieldType.number:
      return numericIndexComparer(values, reverse);
    case FieldType.string:
      return stringIndexComparer(values, reverse);
    case FieldType.boolean:
      return booleanIndexComparer(values, reverse);
    case FieldType.time:
      return timeIndexComparer(values, reverse);
    default:
      return naturalIndexComparer(reverse);
  }
};

/** @public */
export const timeComparer = (a: unknown, b: unknown): number => {
  if (!a || !b) {
    return falsyComparer(a, b);
  }

  if (isNumber(a) && isNumber(b)) {
    return numericComparer(a, b);
  }

  if (isDateTimeInput(a) && isDateTimeInput(b)) {
    if (dateTime(a).isBefore(b)) {
      return -1;
    }

    if (dateTime(b).isBefore(a)) {
      return 1;
    }
  }

  return 0;
};

/** @public */
export const numericComparer = (a: number, b: number): number => {
  return a - b;
};

/** @public */
export const stringComparer = (a: string, b: string): number => {
  if (!a || !b) {
    return falsyComparer(a, b);
  }
  return a.localeCompare(b);
};

export const booleanComparer = (a: boolean, b: boolean): number => {
  return falsyComparer(a, b);
};

const falsyComparer = (a: unknown, b: unknown): number => {
  if (!a && b) {
    return 1;
  }

  if (a && !b) {
    return -1;
  }

  return 0;
};

const timeIndexComparer = (values: Vector<unknown>, reverse: boolean): IndexComparer => {
  return (a: number, b: number): number => {
    const vA = values.get(a);
    const vB = values.get(b);
    return reverse ? timeComparer(vB, vA) : timeComparer(vA, vB);
  };
};

const booleanIndexComparer = (values: Vector<boolean>, reverse: boolean): IndexComparer => {
  return (a: number, b: number): number => {
    const vA = values.get(a);
    const vB = values.get(b);
    return reverse ? booleanComparer(vB, vA) : booleanComparer(vA, vB);
  };
};

const numericIndexComparer = (values: Vector<number>, reverse: boolean): IndexComparer => {
  return (a: number, b: number): number => {
    const vA = values.get(a);
    const vB = values.get(b);
    return reverse ? numericComparer(vB, vA) : numericComparer(vA, vB);
  };
};

const stringIndexComparer = (values: Vector<string>, reverse: boolean): IndexComparer => {
  return (a: number, b: number): number => {
    const vA = values.get(a);
    const vB = values.get(b);
    return reverse ? stringComparer(vB, vA) : stringComparer(vA, vB);
  };
};

const naturalIndexComparer = (reverse: boolean): IndexComparer => {
  return (a: number, b: number): number => {
    return reverse ? numericComparer(b, a) : numericComparer(a, b);
  };
};
