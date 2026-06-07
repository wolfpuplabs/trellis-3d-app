// @ts-nocheck
'use client';

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [modelUrl, setModelUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (!file) return alert('Silakan pilih gambar terlebih dahulu!');
    
    setLoading(true);
    setModelUrl(null);
    setStatusText('Sedang memproses... (Proses konversi gambar menjadi 3D memakan waktu ~15-30 detik, mohon tunggu)');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/generate-3d', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memproses gambar');

      // Ambil hasil URL yang langsung dikirim matang oleh backend
      setModelUrl(data.modelUrl);
      setStatusText('Selesai! Model 3D berhasil dimuat.');

    } catch (err: any) {
      alert(`Kendala: ${err.message}`);
      setStatusText('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', color: '#fff', backgroundColor: '#111', borderRadius: '12px', marginTop: '50px' }}>
      <h2>Trellis Image to 3D Generator</h2>
      <p style={{ color: '#aaa' }}>Ubah gambar 2D kamu menjadi model 3D interaktif secara gratis tanpa batasan saldo.</p>
      
      <div style={{ border: '2px dashed #444', padding: '20px', textAlign: 'center', marginBottom: '20px', borderRadius: '8px' }}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      <button 
        onClick={handleGenerate} 
        disabled={loading}
        style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#444' : '#0070f3', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        {loading ? 'Memproses...' : 'Generate 3D Model'}
      </button>

      {statusText && <p style={{ color: '#0070f3', marginTop: '15px', textAlign: 'center', fontWeight: 'bold' }}>{statusText}</p>}

      {modelUrl && (
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <h3 style={{ color: '#00ff00' }}>✓ Model 3D Siap!</h3>
          <a href={modelUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: '10px 20px', backgroundColor: '#222', color: '#00ff00', border: '1px solid #00ff00', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>
            📥 Unduh Berkas .GLB / .GLTF
          </a>
        </div>
      )}
    </div>
  );
}
