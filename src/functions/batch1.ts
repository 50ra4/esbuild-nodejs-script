import { type Handler } from 'aws-lambda';
import { doBatch1 } from '@/features/batch1/batch1';

export const handler: Handler = async (): Promise<void> => {
  await doBatch1().catch((e) => {
    console.error(e);
    process.exit(1);
  });
};
