import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const templatePath = path.join(root, "dist/index.html");
const serverEntryPath = path.join(root, "dist/server/entry-server.js");

const template = await readFile(templatePath, "utf-8");
const { render } = await import(serverEntryPath);

const appHtml = render();

if (!template.includes('<div id="root"></div>')) {
  throw new Error(
    'Prerender failed: expected placeholder \'<div id="root"></div>\' not found in built index.html.',
  );
}

const finalHtml = template.replace(
  '<div id="root"></div>',
  `<div id="root">${appHtml}</div>`,
);

await writeFile(templatePath, finalHtml, "utf-8");

console.log(`Prerendered ${appHtml.length} chars of HTML into ${path.relative(root, templatePath)}`);
