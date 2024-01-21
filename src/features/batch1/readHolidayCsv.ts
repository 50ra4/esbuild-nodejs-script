import { readFileSync } from 'node:fs';
import { parse } from 'csv-parse/sync';

export const readHolidayCsv = (filePath: string) => {
  const csvFile = readFileSync(filePath);
  const [header, ...records]: string[][] = parse(csvFile);
  return { header, records };
};
