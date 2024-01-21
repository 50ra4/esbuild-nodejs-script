import { isNonNullable } from '@/utils/typeGuard';
import { CodeCommitClient, GetFolderCommand } from '@aws-sdk/client-codecommit';

/**
 * AWS CodeCommitから再起的にフォルダパスを取得する
 * @see https://qiita.com/afukuma/items/a08648763d60045667bf
 */
export const fetchCodeCommitFilePathsRecursively = async ({
  codeCommitClient,
  folderPath,
  repositoryName,
}: {
  codeCommitClient: CodeCommitClient;
  folderPath: string;
  repositoryName: string;
}): Promise<string[]> => {
  const command = new GetFolderCommand({
    folderPath,
    repositoryName,
  });

  const { files = [], subFolders = [] } = await codeCommitClient.send(command);

  const rootFilePaths = files
    .map((file) => file.absolutePath)
    .filter(isNonNullable);
  const subFilePaths = await Promise.all(
    subFolders
      .map((folder) => folder.absolutePath)
      .map(async (folderPath) =>
        !folderPath
          ? []
          : await fetchCodeCommitFilePathsRecursively({
              codeCommitClient,
              folderPath,
              repositoryName,
            }),
      ),
  ).then((v) => v.flat());

  return [...rootFilePaths, ...subFilePaths];
};
