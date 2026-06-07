// @ts-nocheck
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'File gambar tidak ditemukan' }, { status: 400 });
    }

    // 1. Simpan gambar di Vercel Blob Store dengan aman
    const blob = await put(`uploads/${file.name}`, file, { 
      access: 'public',
      multipart: true,
      addRandomSuffix: true
    });

    if (!process.env.HF_TOKEN) {
      return NextResponse.json({ error: 'Variabel rahasia HF_TOKEN belum dipasang di Dashboard Settings Vercel!' }, { status: 500 });
    }

    // 2. Tembak API Gradio Space Trellis Utama di Hugging Face secara legal dengan token backend
    const hfRes = await fetch('https://hysts-trellis.hf.space/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.HF_TOKEN}`
      },
      body: JSON.stringify({
        data: [
          { "name": blob.url, "data": blob.url }, // Format komponen Gradio Image
          7.5, // ss_guidance_scale
          3,   // slat_guidance_scale
          "Slat"
        ],
        fn_index: 0
      }),
    });

    const prediction = await hfRes.json();

    if (!hfRes.ok) {
      return NextResponse.json({ error: `Hugging Face menolak: ${prediction.message || 'Server sedang padat'}` }, { status: 500 });
    }

    // Mengekstrak URL berkas .glb/.gltf matang dari hasil array Hugging Face
    const file3DUrl = prediction.data?.[0]?.url || prediction.data?.[1]?.url;

    if (!file3DUrl) {
      return NextResponse.json({ error: 'Gagal memuat berkas struktur 3D dari Hugging Face Space' }, { status: 500 });
    }

    // Kirim URL hasil jadi langsung ke frontend
    return NextResponse.json({ modelUrl: file3DUrl });

  } catch (error) {
    return NextResponse.json({ error: `Kendala server backend: ${error.message}` }, { status: 500 });
  }
}
