import { doBatch2 } from '@/features/batch2/batch2';
import { type Handler } from 'aws-lambda';

export const handler: Handler = (): void => {
  doBatch2();
};
