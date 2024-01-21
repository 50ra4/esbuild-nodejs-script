import { CodeCommitClient } from '@aws-sdk/client-codecommit';
import { LambdaClient } from '@aws-sdk/client-lambda';
import { deployToLambda } from '../deployToLambda';
import { CodeCommitHandler } from 'aws-lambda/trigger/codecommit';

export const handler: CodeCommitHandler = async (event) => {
  try {
    const { awsRegion: region } = event;
    // TODO: 環境変数などで変えられるようにする
    const repositoryName = 'deploy-to-lambda-test';
    const rootFolderPath = 'edge/functions';

    const codeCommitClient = new CodeCommitClient({ region });
    const lambdaClient = new LambdaClient({ region });

    await deployToLambda({
      repositoryName,
      rootFolderPath,
      codeCommitClient,
      lambdaClient,
    });
    console.log('succeeded deployToLambda.');
  } catch (error) {
    console.error('failed deployToLambda.', error);
  }
};
