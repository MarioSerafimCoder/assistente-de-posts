import { copyFile, mkdir, access } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
for (const directory of ["data", "public/uploads", "public/uploads/generated"]) {
  await mkdir(path.join(root, directory), { recursive: true });
}

try {
  await access(path.join(root, ".env.local"));
} catch {
  await copyFile(path.join(root, ".env.example"), path.join(root, ".env.local"));
  console.log(".env.local criado. Todas as integrações são opcionais.");
}

console.log("Estrutura local preparada. Execute npm run dev.");
