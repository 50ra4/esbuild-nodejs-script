import { format } from "date-fns/format"

export const logger = (...args: ReadonlyArray<any>) => {
    console.log(format(new Date(), 'yyyy-MM-dd'), ...args);
}