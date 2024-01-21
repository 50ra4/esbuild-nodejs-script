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

const main = async () => {
  const isTargetFeatures = process.env.BUILD_TARGET === 'features';

  const entryDir = resolve(
    import.meta.dirname,
    isTargetFeatures ? '../features' : '../functions',
  );

  const targets = readdirSync(entryDir)
    .map((name) => ({
      name: isTargetFeatures ? name : parse(name).name,
      path: isTargetFeatures
        ? join(entryDir, name, 'index.ts')
        : join(entryDir, name),
    }))
    .filter(({ path }) => statSync(path).isFile() && /.ts$/.test(path));

  const entryPoints = Object.fromEntries(
    targets.map(({ name, path }) => [name, path] as const),
  );

  return await build({
    ...OPTIONS,
    outdir: isTargetFeatures ? 'dist/features' : 'dist',
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
