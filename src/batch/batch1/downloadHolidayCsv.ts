import axios from "axios";
import { codeToString, convert } from "encoding-japanese";
import { existsSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const HOLIDAY_CSV_URL =
  "https://www8.cao.go.jp/chosei/shukujitsu/syukujitsu.csv";

export const downloadHolidayCsv = async (outputFileName: string) => {
  const csvFile = await axios(HOLIDAY_CSV_URL, {
    method: "GET",
    responseType: "arraybuffer",
    transformResponse: (data) =>
      // SJISからUNICODEへ変換
      codeToString(convert(data, "UNICODE", "SJIS")),
  }).then(({ data }) => data);

  if (!existsSync(dirname(outputFileName))) {
    mkdirSync(dirname(outputFileName), { recursive: true });
  }
  writeFileSync(outputFileName, csvFile);
};
