import { createHash } from "node:crypto";
import { mkdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";

const outputDir = resolve(process.argv[2] ?? "data/ofac");
const sourceBase = "https://sanctionslistservice.ofac.treas.gov/api/PublicationPreview/exports";
const userAgent = "AUX-OFAC-Mirror/1.0 (+https://aux.prdictionedge.ai/agents)";
const files = [
  { name: "SDN.CSV", minBytes: 1_000_000 },
  { name: "CONS_PRIM.CSV", minBytes: 10_000 },
  { name: "ALT.CSV", minBytes: 100_000 },
  { name: "CONS_ALT.CSV", minBytes: 1_000 },
];

async function download(url) {
  let lastError;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        headers: { Accept: "text/csv,*/*;q=0.1", "User-Agent": userAgent },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return { bytes: Buffer.from(await response.arrayBuffer()), response };
    } catch (error) {
      lastError = error;
      if (attempt < 5) await new Promise((resolveDelay) => setTimeout(resolveDelay, attempt * 2_000));
    }
  }
  throw lastError;
}

const retrievedAt = new Date();
const validUntil = new Date(retrievedAt.getTime() + 12 * 60 * 60 * 1_000);
const temporaryDir = join(dirname(outputDir), `.ofac-refresh-${process.pid}`);
await rm(temporaryDir, { recursive: true, force: true });
await mkdir(temporaryDir, { recursive: true });

try {
  const manifestFiles = [];
  for (const definition of files) {
    const sourceUrl = `${sourceBase}/${definition.name}`;
    const { bytes, response } = await download(sourceUrl);
    if (bytes.length < definition.minBytes) throw new Error(`${definition.name} was unexpectedly small (${bytes.length} bytes)`);
    if (definition.name === "SDN.CSV" && !bytes.includes(Buffer.from("BANCO NACIONAL DE CUBA"))) {
      throw new Error("SDN.CSV failed the known-record plausibility check");
    }
    await writeFile(join(temporaryDir, definition.name), bytes);
    manifestFiles.push({
      name: definition.name,
      source_url: sourceUrl,
      bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      source_last_modified: response.headers.get("last-modified"),
    });
  }

  const manifest = {
    schema_version: "1.0",
    dataset: "US Treasury OFAC Sanctions List Service CSV mirror",
    authority: "https://ofac.treasury.gov/sanctions-list-service",
    mirror_operator: "AUX / PrdictionEdge",
    retrieved_at: retrievedAt.toISOString(),
    valid_until: validUntil.toISOString(),
    refresh_interval_hours: 6,
    files: manifestFiles,
    integrity_policy: "AUX accepts a mirror file only while this manifest is fresh and its byte count and SHA-256 match.",
  };
  await writeFile(join(temporaryDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

  await mkdir(outputDir, { recursive: true });
  for (const entry of [...files.map(({ name }) => name), "manifest.json"]) {
    const target = join(outputDir, basename(entry));
    await rm(target, { force: true });
    await rename(join(temporaryDir, entry), target);
  }
  const size = (await stat(join(outputDir, "manifest.json"))).size;
  process.stdout.write(`Refreshed ${files.length} OFAC files; manifest ${size} bytes; valid until ${validUntil.toISOString()}\n`);
} finally {
  await rm(temporaryDir, { recursive: true, force: true });
}
