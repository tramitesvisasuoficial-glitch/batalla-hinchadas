const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Create the 'avatars' bucket
    await prisma.$executeRawUnsafe(`
      INSERT INTO storage.buckets (id, name, public) 
      VALUES ('avatars', 'avatars', true)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log("✅ Bucket 'avatars' creado o ya existente.");

    // 2. Allow Public Uploads (INSERT)
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Public Uploads" ON storage.objects FOR INSERT TO public 
      WITH CHECK (bucket_id = 'avatars');
    `);
    console.log("✅ Política 'Public Uploads' creada.");
    
    // 3. Allow Public Selects (SELECT)
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Public Selects" ON storage.objects FOR SELECT TO public 
      USING (bucket_id = 'avatars');
    `);
    console.log("✅ Política 'Public Selects' creada.");
  } catch (e) {
    if (e.message && e.message.includes("already exists")) {
       console.log("✅ Política ya existía.");
    } else {
       console.error("❌ Error configurando Storage:", e);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
