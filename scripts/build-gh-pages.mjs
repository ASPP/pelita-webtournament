import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

const ROOT = process.cwd();
const TMP = path.join(ROOT, '.tmp-next-build');

// Clean temp folder
await fs.remove(TMP);
await fs.ensureDir(TMP);

// Copy everything except api routes
await fs.copy(path.join(ROOT, 'app'), path.join(TMP, 'app'), {
  filter: src => {
    // exclude api routes
    if (src.includes(`${path.sep}api${path.sep}`)) return false;
    if (src.endsWith(`${path.sep}api`)) return false;
    return true;
  },
});

// Copy needed support folders
await fs.copy(path.join(ROOT, 'public'), path.join(TMP, 'public'));
await fs.copy(path.join(ROOT, 'lib'), path.join(TMP, 'lib'));

// Write static config
await fs.writeFile(
  path.join(TMP, 'next.config.js'),
  `
module.exports = {
  output: "export",
  // basePath: process.env.BASE_PATH || "",
  basePath: "/pelita-webtournament",
  images: {
    unoptimized: true,
  },
};
`,
);

// Copy tsconfig (for @ import resolution)
await fs.copy(path.join(ROOT, 'tsconfig.json'), path.join(TMP, 'tsconfig.json'));

// Copy minimal package.json (important for Next CLI resolution)
await fs.writeJSON(path.join(TMP, 'package.json'), {
  name: 'tmp-build',
  private: true,
});

// Run build in temp dir
execSync('npx next build', {
  cwd: TMP,
  stdio: 'inherit',
});
