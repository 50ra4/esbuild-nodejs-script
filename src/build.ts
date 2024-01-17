import { BuildOptions, build } from "esbuild";
import { join, resolve } from "node:path";
import { readdirSync } from "node:fs";

const OPTIONS: BuildOptions = {
  bundle: true,
  splitting: false,
  minify: true,
  keepNames: true,
  sourcemap: "inline",
  platform: "node",
  format: "esm",
  tsconfig: "tsconfig.json",
  alias: { "@": "src" },
  external: [],
};

const main = async () => {
  const entryDir = resolve(import.meta.dirname, "./batch");
  const targets = readdirSync(entryDir).map((name: string) => ({
    path: join(entryDir, name),
    name,
  }));
  const entryPoints = Object.fromEntries(
    targets.map(
      (target) => [target.name, join(target.path, `${target.name}.ts`)] as const
    )
  );

  return await build({
    ...OPTIONS,
    outdir: `dist`,
    entryNames: "[dir]/[name]/index",
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
