import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

function loadEnvLocal() {
  try {
    const content = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
    }
  } catch {
    // no .env.local, rely on process env
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY.");
  process.exit(1);
}

const db = createClient(url, secretKey, { auth: { persistSession: false } });

const bucketName = "banner-images";

const { data: buckets, error: listError } = await db.storage.listBuckets();
if (listError) {
  console.error("Falha ao listar buckets:", listError.message);
  process.exit(1);
}

const exists = buckets?.some((b) => b.name === bucketName);

if (exists) {
  console.log(`Bucket "${bucketName}" já existe.`);
} else {
  const { error: createError } = await db.storage.createBucket(bucketName, {
    public: true,
    fileSizeLimit: "5MB",
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
  });

  if (createError) {
    console.error("Falha ao criar bucket:", createError.message);
    process.exit(1);
  }

  console.log(`Bucket "${bucketName}" criado com sucesso (público).`);
}
