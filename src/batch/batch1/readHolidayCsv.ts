import { readFileSync } from "node:fs";
import { parse as csvParse } from "csv-parse/sync";

export const readHolidayCsv = (filePath: string) => {
  const csvFile = readFileSync(filePath);
  const [header, ...records]: string[][] = csvParse(csvFile);
  return { header, records };
};
