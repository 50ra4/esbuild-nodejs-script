export const isNonNullable = <T>(x: T): x is NonNullable<T> =>
  typeof x !== 'undefined' && x !== null;
