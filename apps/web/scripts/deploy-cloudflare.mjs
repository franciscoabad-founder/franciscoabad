// Builds the site with the private variables from apps/web/.env and publishes it to Cloudflare.
// Values are loaded into the child process environment only. This script never prints them.
// Usage (from apps/web):  npm run deploy:cf
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envFile = resolve(root, ".env");
if (!existsSync(envFile)) {
  console.error("Missing apps/web/.env");
  process.exit(1);
}

const env = { ...process.env };
let loaded = 0;
for (const raw of readFileSync(envFile, "utf8").split(/\r?\n/)) {
  const line = raw.trim();
  if (!line || line.startsWith("#")) continue;
  const i = line.indexOf("=");
  if (i < 1) continue;
  const key = line.slice(0, i).trim();
  let val = line.slice(i + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
  if (/^[A-Z_][A-Z0-9_]*$/.test(key)) { env[key] = val; loaded++; }
}
console.log(`Loaded ${loaded} variables (names only, values are never printed).`);

const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { cwd: root, env, stdio: "inherit", shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

console.log("1/2 Building...");
run("npm", ["run", "build"]);
console.log("2/2 Deploying to Cloudflare...");
run("npx", ["wrangler", "deploy"]);
console.log("Done.");
