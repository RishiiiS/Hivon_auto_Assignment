import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { extname, join } from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

function hasCloudinaryConfig() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function initCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

async function uploadBufferToCloudinary(buffer, originalFilename) {
  initCloudinary();

  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'the-archive';
  const baseName = (originalFilename || 'upload')
    .replace(/\.[^/.]+$/, '')
    .replace(/[^\w\-]+/g, '-')
    .slice(0, 80);

  return await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        public_id: `${Date.now()}-${baseName || 'file'}`,
        overwrite: false,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
}

export async function POST(request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Prefer Cloudinary in production (and whenever configured).
    if (hasCloudinaryConfig()) {
      const result = await uploadBufferToCloudinary(buffer, file.name);
      return NextResponse.json({ url: result.secure_url }, { status: 200 });
    }

    // Fallback (local dev): save to public/uploads
    const timestamp = Date.now();
    const extension = extname(file.name) || '.jpg';
    const uniqueFilename = `${timestamp}-${Math.random()
      .toString(36)
      .substring(7)}${extension}`;

    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const filepath = join(uploadDir, uniqueFilename);
    await writeFile(filepath, buffer);

    return NextResponse.json({ url: `/uploads/${uniqueFilename}` }, { status: 200 });

  } catch (error) {
    console.error('File Upload Error:', error);
    return NextResponse.json({ error: 'Upload failed: ' + error.message }, { status: 500 });
  }
}
