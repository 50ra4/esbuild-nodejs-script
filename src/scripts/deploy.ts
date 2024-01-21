import { deployToLambda } from '../tools/deployToLambda';
import { CodeCommitClient } from '@aws-sdk/client-codecommit';
import { LambdaClient } from '@aws-sdk/client-lambda';

const main = async () => {
  // TODO: 環境変数などで変えられるようにする
  const region = 'ap-northeast-1';
  const repositoryName = 'deploy-to-lambda-test';
  const rootFolderPath = 'edge/functions';

  // TODO: デフォルトで設定されていそう？
  const credentials = {
    accessKeyId: process.env.ACCESS_KEY_ID ?? 'UNKNOWN',
    secretAccessKey: process.env.SECRET_ACCESS_KEY_ID ?? 'UNKNOWN',
  };

  // TODO: クライアントを返却するファイル作成する？
  const codeCommitClient = new CodeCommitClient({ region, credentials });
  const lambdaClient = new LambdaClient({ region, credentials });

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
