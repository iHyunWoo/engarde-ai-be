import fs from "fs";
import path from "path";

const dir = path.resolve(__dirname, "../api-sdk/src/structures");
const files = fs.readdirSync(dir);

const exportsStr = files
  .filter((file) => file.endsWith(".ts") && file !== "index.ts")
  .map((file) => `export * from "./${file.replace(/\.ts$/, "")}";`)
  .join("\n");

fs.writeFileSync(path.join(dir, "index.ts"), exportsStr);