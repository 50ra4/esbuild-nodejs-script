import { doBatch1 } from './main';

export const handler = async (): Promise<void> => {
  await doBatch1().catch((e) => {
    console.error(e);
    process.exit(1);
  });
};

// TODO: for script test
await handler();
