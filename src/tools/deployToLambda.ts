import {
  CodeCommitClient,
  GetFolderCommand,
  GetFileCommand,
} from '@aws-sdk/client-codecommit';
import { fetchCodeCommitFilePathsRecursively } from './fetchCodeCommitFilePathsRecursively';
import { isNonNullable } from '@/utils/typeGuard';

export const deployToLambda = async () => {
  // TODO: 環境変数などで変えられるようにする
  const repositoryName = 'deploy-to-lambda-test';
  const rootFolderPath = 'edge/functions';
  const codeCommitClient = new CodeCommitClient({ region: 'ap-northeast-1' });

  try {
    // 直下からfunctionsのフォルダ一覧を取得する
    const { subFolders = [] } = await codeCommitClient.send(
      new GetFolderCommand({
        folderPath: rootFolderPath,
        repositoryName,
      }),
    );
    if (!subFolders.length) {
      throw new Error(`not found functions in folder(${rootFolderPath}).`);
    }

    // フォルダーごとに再帰的にフォルダの一覧を取得する
    const targetFunctions = await Promise.all(
      subFolders
        .map((folder) => folder.absolutePath)
        .filter(isNonNullable)
        .map(async (folderPath) => {
          const filePaths = await fetchCodeCommitFilePathsRecursively({
            codeCommitClient,
            folderPath,
            repositoryName,
          });
          return { name: 'TODO: function-name', filePaths };
        }),
    );

    for (const { name, filePaths } of targetFunctions) {
      // function-name（フォルダ）ごとにファイルの一覧を取得する
      const results = await Promise.all(
        filePaths.map((filePath) =>
          codeCommitClient.send(
            new GetFileCommand({ repositoryName, filePath }),
          ),
        ),
      );

      // TODO: 後で消す
      console.log(
        `[${name}] fetched files`,
        results.map((v) => v.filePath),
      );
    }

    console.log('succeeded deployToLambda.', targetFunctions);
  } catch (error) {
    console.error('failed deployToLambda.', error);
  }
};
