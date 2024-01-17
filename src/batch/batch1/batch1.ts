import { logger } from "@/utils/logger.ts";
import { readdirSync } from "node:fs";

function main() {
  const files = readdirSync(".");
  logger("batch1", files);
}

main();
