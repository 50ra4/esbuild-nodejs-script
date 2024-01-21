import { type BuildOptions, build } from 'esbuild';
import { join, resolve, parse } from 'node:path';
import { readdirSync, statSync } from 'node:fs';

/**
 * commonjs用ライブラリをESMプロジェクトでbundleする際に生じることのある問題への対策
 * @see https://zenn.dev/junkor/articles/2bcd22ca08d21d#esbuild%E3%81%AE%E3%83%93%E3%83%AB%E3%83%89%E3%82%AA%E3%83%97%E3%82%B7%E3%83%A7%E3%83%B3
 */
const bannerJs = `
import { createRequire } from "module";
import url from "url";

const require = createRequire(import.meta.url);
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
`
  .trim()
  .split('\n')
  .join('');

const OPTIONS: BuildOptions = {
  bundle: true,
  splitting: false,
  minify: true,
  keepNames: true,
  sourcemap: 'inline',
  platform: 'node',
  format: 'esm',
  outExtension: {
    // package.jsonの出力が不要になるため、拡張子を.mjsに
    '.js': '.mjs',
  },
  banner: {
    js: bannerJs,
  },
  alias: { '@': 'src' },
  external: [],
  // tsconfig: "tsconfig.json", // tsconfig.jsonを利用する場合は明示不要
};

type BuildTarget = NonNullable<typeof process.env.BUILD_TARGET>;

const config = {
  features: {
    entryDir: resolve(import.meta.dirname, '../features'),
    toTarget: (entryDirname: string, fileName: string) => ({
      name: fileName,
      path: join(entryDirname, fileName, 'index.ts'),
    }),
    outputDir: 'dist/features',
  },
  functions: {
    entryDir: resolve(import.meta.dirname, '../functions'),
    toTarget: (entryDirname: string, fileName: string) => ({
      name: parse(fileName).name,
      path: join(entryDirname, fileName),
    }),
    outputDir: 'dist/functions',
  },
  scripts: {
    entryDir: resolve(import.meta.dirname, '../scripts'),
    toTarget: (entryDirname: string, fileName: string) => ({
      name: parse(fileName).name,
      path: join(entryDirname, fileName),
    }),
    outputDir: 'dist/scripts',
  },
  'tools/functions': {
    entryDir: resolve(import.meta.dirname, '../tools/functions'),
    toTarget: (entryDirname: string, fileName: string) => ({
      name: parse(fileName).name,
      path: join(entryDirname, fileName),
    }),
    outputDir: 'dist/tools/functions',
  },
} satisfies Record<BuildTarget, Record<PropertyKey, unknown>>;

const isTypeScriptFile = (path: string) =>
  statSync(path).isFile() && /.ts$/.test(path);

const main = async () => {
  // TODO: pathを受け取り、ディレクトリで処理を分けるように修正する
  const { entryDir, toTarget, outputDir } =
    config[process.env.BUILD_TARGET ?? 'functions'];

  const targets = readdirSync(entryDir)
    .map((fileName) => toTarget(entryDir, fileName))
    .filter(({ path }) => isTypeScriptFile(path));

  const entryPoints = Object.fromEntries(
    targets.map(({ name, path }) => [name, path] as const),
  );

  return await build({
    ...OPTIONS,
    // FIXME: ディレクトリ構成を保ってoutputする？
    outdir: outputDir,
    entryNames: '[dir]/[name]/index',
    entryPoints,
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
