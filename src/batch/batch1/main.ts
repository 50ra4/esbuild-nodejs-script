// FIXME: なぜか@が解決できないため、とりあえず相対パスで
import { logger } from "../../utils/logger.ts";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { downloadHolidayCsv } from "./downloadHolidayCsv.ts";

export const doBatch1 = async () => {
  const csvOutputDir = join(import.meta.dirname, "__temp");
  const csvOutputFileName = join(csvOutputDir, "holiday.csv");
  await downloadHolidayCsv(csvOutputFileName);

  logger("batch1", readdirSync(csvOutputDir));
};
