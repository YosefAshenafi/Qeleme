import fs from 'fs';
import path from 'path';
import ts from 'typescript';

function collectCommentRanges(sourceText, sourceFile) {
  const ranges = [];
  const seen = new Set();

  function pushRange(start, end) {
    const key = `${start}:${end}`;
    if (seen.has(key)) return;
    seen.add(key);
    ranges.push({ start, end });
  }

  function visit(node) {
    const lead = ts.getLeadingCommentRanges(sourceText, node.pos);
    if (lead) {
      for (const r of lead) {
        pushRange(r.pos, r.end);
      }
    }
    const trail = ts.getTrailingCommentRanges(sourceText, node.end);
    if (trail) {
      for (const r of trail) {
        pushRange(r.pos, r.end);
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  ranges.sort((a, b) => b.start - a.start);
  return ranges;
}

function stripFile(filePath) {
  const sourceText = fs.readFileSync(filePath, 'utf8');
  const kind = filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, kind);
  const ranges = collectCommentRanges(sourceText, sourceFile);
  let out = sourceText;
  for (const { start, end } of ranges) {
    const slice = out.slice(start, end);
    const replacement = /\n/.test(slice) ? '\n' : '';
    out = out.slice(0, start) + replacement + out.slice(end);
  }
  out = out.replace(/\n{3,}/g, '\n\n');
  if (out !== sourceText) {
    fs.writeFileSync(filePath, out, 'utf8');
    return true;
  }
  return false;
}

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git' || name === 'dist') continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(tsx?)$/.test(name) && !name.endsWith('.d.ts')) out.push(p);
  }
  return out;
}

const root = path.resolve(process.argv[2] || '.');
const targets = [path.join(root, 'src'), path.join(root, 'app')].filter((d) => fs.existsSync(d));
let changed = 0;
for (const dir of targets) {
  for (const f of walk(dir)) {
    if (stripFile(f)) changed += 1;
  }
}
console.log(`strip-ts-comments: updated ${changed} files under ${targets.join(', ')}`);
