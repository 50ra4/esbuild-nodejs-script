import { format } from 'date-fns/format';

export const logger = (...args: readonly any[]) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  console.log(format(new Date(), 'yyyy-MM-dd'), ...args);
};
