import { CodeCommitClient, GetFolderCommand } from '@aws-sdk/client-codecommit';
import { fetchCodeCommitFilePathsRecursively } from './fetchCodeCommitFilePathsRecursively';
import { isNonNullable } from '@/utils/typeGuard';

export const deployToLambda = async () => {
  // TODO: 環境変数などで変えられるようにする
  const repositoryName = 'deploy-to-lambda-test';
  const rootFolderPath = 'edge/functions';
  const codeCommitClient = new CodeCommitClient({ region: 'ap-northeast-1' });

  try {
    // 直下からディレクトリの一覧を取得する
    const { subFolders = [] } = await codeCommitClient.send(
      new GetFolderCommand({
        folderPath: 'edge/functions',
        repositoryName,
      }),
    );

    if (!subFolders.length) {
      throw new Error(`not found functions in folder(${rootFolderPath}).`);
    }

    const targetFunctions = await Promise.all(
      subFolders
        .map((folder) => folder.absolutePath)
        .filter(isNonNullable)
        .map(async (folderPath) => {
          const files = await fetchCodeCommitFilePathsRecursively({
            codeCommitClient,
            folderPath,
            repositoryName,
          });
          return { name: 'TODO: function-name', files };
        }),
    );

    console.log('succeeded deployToLambda.', targetFunctions);
  } catch (error) {
    console.error('failed deployToLambda.', error);
  }
};
