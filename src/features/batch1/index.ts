import { doBatch1 } from './batch1';

doBatch1()
  .then(() => {
    console.log('success');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
