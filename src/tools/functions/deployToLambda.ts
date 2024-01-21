import { deployToLambda } from '../deployToLambda';
import { CodeCommitHandler } from 'aws-lambda/trigger/codecommit';

export const handler: CodeCommitHandler = async (event) => {
  try {
    const { awsRegion } = event;
    await deployToLambda({ region: awsRegion });
    console.log('succeeded deployToLambda.');
  } catch (error) {
    console.error('failed deployToLambda.', error);
  }
};
