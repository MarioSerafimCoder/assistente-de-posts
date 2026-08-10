import { access } from "node:fs/promises";
import path from "node:path";

const checks = [];
const add = (name, ok, detail) => checks.push({ name, ok, detail });
add("Node.js >= 20", Number(process.versions.node.split(".")[0]) >= 20, process.versions.node);
for (const target of ["node_modules/next", "node_modules/openai", "node_modules/puppeteer", ".env.local"]) {
  try { await access(path.resolve(process.cwd(), target)); add(target, true, "encontrado"); }
  catch { add(target, false, "ausente"); }
}
add("OPENAI_API_KEY", Boolean(process.env.OPENAI_API_KEY), process.env.OPENAI_API_KEY ? "configurada" : "será carregada pelo Next.js a partir de .env.local");
for (const check of checks) console.log(`${check.ok ? "OK" : "ATENÇÃO"}  ${check.name}: ${check.detail}`);
process.exitCode = checks.some((check) => !check.ok && check.name !== "OPENAI_API_KEY") ? 1 : 0;
