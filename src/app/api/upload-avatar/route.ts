import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !supabaseKey) {
      console.error("Faltan variables de entorno de Supabase (SUPABASE_URL o KEY)");
      return NextResponse.json({ error: "Configuración de almacenamiento no disponible" }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 });
    }

    // Validación de MIME type (ya lo hacemos en el frontend, pero seguridad en backend)
    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json({ error: "Formato de imagen no soportado" }, { status: 400 });
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo es demasiado grande (Máx 5MB)" }, { status: 400 });
    }

    // Convertir File a Buffer/ArrayBuffer para subirlo
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generar un nombre seguro y único
    const ext = file.name.split('.').pop() || 'webp';
    const uniqueFilename = `${crypto.randomUUID()}-${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(uniqueFilename, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error("Error de Supabase Storage:", error);
      return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 });
    }

    // Obtener la URL pública
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path);

    return NextResponse.json({ 
      success: true, 
      url: publicUrlData.publicUrl 
    }, { status: 200 });

  } catch (error) {
    console.error("Excepción en upload-avatar:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
