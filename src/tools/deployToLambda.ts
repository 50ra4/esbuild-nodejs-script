import {
  CodeCommitClient,
  GetFolderCommand,
  GetFileCommand,
} from '@aws-sdk/client-codecommit';
import { fetchCodeCommitFilePathsRecursively } from './fetchCodeCommitFilePathsRecursively';
import { isNonNullable } from '@/utils/typeGuard';
import * as archiver from 'archiver';
import { createWriteStream, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Buffer } from 'node:buffer';
import {
  LambdaClient,
  UpdateFunctionCodeCommand,
} from '@aws-sdk/client-lambda';

export const deployToLambda = async ({
  repositoryName,
  rootFolderPath,
  codeCommitClient,
  lambdaClient,
}: {
  repositoryName: string;
  rootFolderPath: string;
  codeCommitClient: CodeCommitClient;
  lambdaClient: LambdaClient;
}) => {
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
        return { functionName: 'TODO: function-name', filePaths };
      }),
  );

  for (const { functionName, filePaths } of targetFunctions) {
    // function-name（フォルダ）ごとにファイルの一覧を取得する
    const files = await Promise.all(
      filePaths.map((filePath) =>
        codeCommitClient.send(new GetFileCommand({ repositoryName, filePath })),
      ),
    );

    // TODO: 不要であれば、後で消す
    console.log(
      `[${functionName}] fetched files`,
      files.map((v) => v.filePath),
    );

    // 取得したファイルをzipに固める
    const archive = archiver('zip', { zlib: { level: 9 } });
    const zipFilePath = join(__dirname, 'tmp', `${functionName}.zip`);
    archive.pipe(
      createWriteStream(zipFilePath).on('close', () => {
        console.log(`created ${zipFilePath}`);
      }),
    );

    files
      .map(({ fileContent, filePath }) =>
        !fileContent || !filePath ? null : { fileContent, filePath },
      )
      .filter(isNonNullable)
      .forEach(({ fileContent, filePath }) => {
        archive.append(Buffer.from(fileContent), {
          name: join(__dirname, filePath),
        });
      });

    await archive.finalize();

    // TODO: 不要であれば、後で消す
    console.log(`[${functionName}] archive success.`);

    // zipに固めたファイルをlambdaにuploadする
    const result = await lambdaClient.send(
      new UpdateFunctionCodeCommand({
        FunctionName: functionName,
        ZipFile: readFileSync(zipFilePath),
      }),
    );

    // TODO: 不要であれば、後で消す
    console.log(`[${functionName}] upload success.`, result);
  }
};
