import CodeCommit from 'aws-sdk/clients/codecommit';
import Lambda from 'aws-sdk/clients/lambda';
import archiver from 'archiver';
import { join } from 'node:path';
import { createWriteStream, readFileSync } from 'node:fs';

const codeCommit = new CodeCommit();
const lambda = new Lambda();

const readFilePathsFromCodeCommit = async (
  folderPath: string,
): Promise<string[]> => {
  const result = await codeCommit
    .getFolder({
      folderPath,
      repositoryName: process.env.REPOSITORY_NAME,
    })
    .promise();

  const rootFilePaths =
    result.files?.map((file) => file.absolutePath ?? '') ?? [];

  const subFilePaths = await Promise.all(
    result.subFolders?.map(
      async (folder) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await readFilePathsFromCodeCommit(folder.absolutePath ?? ''),
    ) ?? [],
  ).then((v) => v.flat());

  return [...rootFilePaths, ...subFilePaths].filter((v) => v);
};

const downloadCodeFromCodeCommit = async (folderPath: string) => {
  const filePaths = await readFilePathsFromCodeCommit(folderPath);
  const files = await Promise.all(
    filePaths.map(
      async (filePath) =>
        await codeCommit
          .getFile({
            filePath,
            repositoryName: process.env.REPOSITORY_NAME,
          })
          .promise(),
    ),
  );
  return files;
};

const uploadCodeToLambda = async ({
  functionName,
  zipFilePath,
}: {
  functionName: string;
  zipFilePath: string;
}) => {
  await lambda
    .updateFunctionCode({
      FunctionName: functionName,
      ZipFile: readFileSync(zipFilePath),
    })
    .promise();
};

/**
 * @see https://qiita.com/afukuma/items/a08648763d60045667bf
 */
const deployFromCodeCommitToLambda = async (folderPath: string) => {
  const rootFolder = await codeCommit
    .getFolder({
      folderPath,
      repositoryName: process.env.REPOSITORY_NAME,
    })
    .promise();

  const functionList = (
    rootFolder.subFolders?.map((folder) => folder.absolutePath ?? '') ?? []
  )
    .filter((path) => !!path)
    .map((folderPath) => ({
      folderPath,
      // TODO:
      name: folderPath,
    }));

  functionList.forEach(async ({ name, folderPath }) => {
    const files = await downloadCodeFromCodeCommit(folderPath);

    const archive = archiver('zip', { zlib: { level: 9 } });

    const zipFilePath = join(__dirname, `${name}.zip`);
    const outputZipStream = createWriteStream(zipFilePath).on('close', () => {
      console.log(`created ${zipFilePath}`);
      uploadCodeToLambda({ functionName: name, zipFilePath });
    });
    archive.pipe(outputZipStream);

    files.forEach((file) => {
      archive.append(file.fileContent.toString(), {
        name: join(__dirname, file.filePath),
      });
    });

    await archive.finalize();
  });
};

// TODO: folderPathを修正する
await deployFromCodeCommitToLambda('/');
