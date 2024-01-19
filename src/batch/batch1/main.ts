import { logger } from "@/utils/logger.ts";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { downloadHolidayCsv } from "./downloadHolidayCsv.ts";
import { readHolidayCsv } from "./readHolidayCsv.ts";

export const doBatch1 = async () => {
  const csvOutputDir = join(import.meta.dirname, "__temp");
  const csvOutputFileName = join(csvOutputDir, "holiday.csv");
  await downloadHolidayCsv(csvOutputFileName);

  const { records } = readHolidayCsv(csvOutputFileName);

  logger("batch1", readdirSync(csvOutputDir), records.slice(0, 3));
};
