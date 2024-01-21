import { deployToLambda } from '../tools/deployToLambda';
import { CodeCommitClient } from '@aws-sdk/client-codecommit';
import { LambdaClient } from '@aws-sdk/client-lambda';

const main = async () => {
  // TODO: 環境変数などで変えられるようにする
  const region = 'ap-northeast-1';
  const repositoryName = 'deploy-to-lambda-test';
  const rootFolderPath = 'edge/functions';

  const codeCommitClient = new CodeCommitClient({ region });
  const lambdaClient = new LambdaClient({ region });

  return deployToLambda({
    repositoryName,
    rootFolderPath,
    codeCommitClient,
    lambdaClient,
  });
};

main()
  .then((result) => {
    console.log(result);
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
