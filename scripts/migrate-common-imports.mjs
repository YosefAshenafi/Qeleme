import fs from 'fs';
import path from 'path';

const REPLACEMENTS = [
  ['@/appStyles/', '@/features/common/appStyles/'],
  ['@/constants/', '@/features/common/constants/'],
  ['@/components/', '@/features/common/components/'],
  ['@/services/', '@/features/common/services/'],
  ['@/utils/', '@/features/common/utils/'],
  ['@/types/', '@/features/common/types/'],
  ['@/hooks/', '@/features/common/hooks/'],
];

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git') continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(tsx?|json)$/.test(name)) out.push(p);
  }
  return out;
}

const roots = ['app', 'src'].filter((d) => fs.existsSync(path.join(process.cwd(), d)));
let changed = 0;
for (const root of roots) {
  for (const f of walk(path.join(process.cwd(), root))) {
    if (f.includes(`${path.sep}node_modules${path.sep}`)) continue;
    let t = fs.readFileSync(f, 'utf8');
    let next = t;
    for (const [a, b] of REPLACEMENTS) {
      next = next.split(a).join(b);
    }
    if (next !== t) {
      fs.writeFileSync(f, next, 'utf8');
      changed += 1;
    }
  }
}

const tsconfig = path.join(process.cwd(), 'tsconfig.json');
let t = fs.readFileSync(tsconfig, 'utf8');
const map = {
  '"@/components/*": ["src/components/*"]': '"@/components/*": ["src/features/common/components/*"]',
  '"@/hooks/*": ["src/hooks/*"]': '"@/hooks/*": ["src/features/common/hooks/*"]',
  '"@/services/*": ["src/services/*"]': '"@/services/*": ["src/features/common/services/*"]',
  '"@/types/*": ["src/types/*"]': '"@/types/*": ["src/features/common/types/*"]',
  '"@/utils/*": ["src/utils/*"]': '"@/utils/*": ["src/features/common/utils/*"]',
  '"@/constants/*": ["src/constants/*"]': '"@/constants/*": ["src/features/common/constants/*"]',
};
const addAppStyles =
  '"@/config/*": ["src/core/config/*"],\n      "@/assets/*": ["assets/*"]';
const addAppStylesNew =
  '"@/config/*": ["src/core/config/*"],\n      "@/appStyles/*": ["src/features/common/appStyles/*"],\n      "@/assets/*": ["assets/*"]';
let tc = t;
for (const [a, b] of Object.entries(map)) {
  tc = tc.replace(a, b);
}
if (tc !== t) {
  fs.writeFileSync(tsconfig, tc, 'utf8');
  changed += 1;
}
let tc2 = fs.readFileSync(tsconfig, 'utf8');
if (!tc2.includes('"@/appStyles/*"')) {
  tc2 = tc2.replace(addAppStyles, addAppStylesNew);
  fs.writeFileSync(tsconfig, tc2, 'utf8');
  changed += 1;
}

console.log(`migrate-common-imports: updated ${changed} files`);
