import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXTS = new Set([".ts", ".tsx", ".js", ".mjs", ".css"]);
const IGNORE = new Set(["node_modules", ".next", ".git", "dist", "build", "public"]);

function stripTsxComments(code) {
  code = code.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "");

  let out = "";
  let i = 0;
  const n = code.length;
  let state = "code";
  let stringChar = "";
  const braceStack = [];

  while (i < n) {
    const c = code[i];
    const c2 = code[i + 1];

    if (state === "code") {
      if (c === "/" && c2 === "/") {
        state = "line";
        i += 2;
        continue;
      }
      if (c === "/" && c2 === "*") {
        state = "block";
        i += 2;
        continue;
      }
      if (c === '"' || c === "'") {
        state = "string";
        stringChar = c;
        out += c;
        i++;
        continue;
      }
      if (c === "`") {
        state = "template";
        out += c;
        i++;
        continue;
      }
      if (c === "}" && braceStack.length > 0) {
        braceStack.pop();
        state = "template";
        out += c;
        i++;
        continue;
      }
      out += c;
      i++;
      continue;
    }

    if (state === "line") {
      if (c === "\n") {
        state = "code";
        out += c;
      }
      i++;
      continue;
    }

    if (state === "block") {
      if (c === "*" && c2 === "/") {
        state = "code";
        i += 2;
        continue;
      }
      if (c === "\n") {
        out += c;
      }
      i++;
      continue;
    }

    if (state === "string") {
      out += c;
      if (c === "\\") {
        if (c2) out += c2;
        i += 2;
        continue;
      }
      if (c === stringChar) {
        state = "code";
      }
      i++;
      continue;
    }

    if (state === "template") {
      out += c;
      if (c === "\\") {
        if (c2) out += c2;
        i += 2;
        continue;
      }
      if (c === "`") {
        state = "code";
        i++;
        continue;
      }
      if (c === "$" && c2 === "{") {
        braceStack.push(true);
        state = "code";
        out += c2;
        i += 2;
        continue;
      }
      i++;
      continue;
    }
  }

  out = out
    .split("\n")
    .map((l) => l.replace(/[ \t]+$/, ""))
    .join("\n");
  out = out.replace(/\n{3,}/g, "\n\n");
  return out;
}

function stripCssComments(code) {
  let out = "";
  let i = 0;
  const n = code.length;
  let state = "code";
  let stringChar = "";

  while (i < n) {
    const c = code[i];
    const c2 = code[i + 1];

    if (state === "code") {
      if (c === "/" && c2 === "*") {
        state = "block";
        i += 2;
        continue;
      }
      if (c === '"' || c === "'") {
        state = "string";
        stringChar = c;
        out += c;
        i++;
        continue;
      }
      out += c;
      i++;
      continue;
    }
    if (state === "block") {
      if (c === "*" && c2 === "/") {
        state = "code";
        i += 2;
        continue;
      }
      if (c === "\n") out += c;
      i++;
      continue;
    }
    if (state === "string") {
      out += c;
      if (c === "\\") {
        if (c2) out += c2;
        i += 2;
        continue;
      }
      if (c === stringChar) {
        state = "code";
      }
      i++;
      continue;
    }
  }

  out = out
    .split("\n")
    .map((l) => l.replace(/[ \t]+$/, ""))
    .join("\n");
  out = out.replace(/\n{3,}/g, "\n\n");
  return out;
}

function walk(dir, baseDir, changed) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, baseDir, changed);
    } else {
      const ext = path.extname(entry.name);
      if (!EXTS.has(ext)) continue;
      const src = fs.readFileSync(full, "utf8");
      const out = ext === ".css" ? stripCssComments(src) : stripTsxComments(src);
      if (out !== src) {
        fs.writeFileSync(full, out);
        changed.push(path.relative(baseDir, full));
      }
    }
  }
}

const root = path.resolve(__dirname, "..");
const changed = [];
walk(root, root, changed);
console.log(`Cleaned ${changed.length} files`);
for (const f of changed) console.log("  " + f);
