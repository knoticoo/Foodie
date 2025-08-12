import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

const defaultApiBase = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:3000`
  : 'http://127.0.0.1:3000';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? defaultApiBase;

export const SubmitRecipePage: React.FC = () => {
  const { token, authorizedFetch } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<string>('[]');
  const [images, setImages] = useState<string[]>([]);
  const [status, setStatus] = useState('');

  if (!token) return <div>Please login to submit a recipe.</div>;

  const onUploadImage = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result);
      const res = await authorizedFetch(`${API_BASE_URL}/api/uploads/image-base64`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl })
      });
      const data = await res.json();
      if (res.ok && data.path) setImages(prev => prev.concat(data.path));
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Submitting...');
    try {
      const res = await authorizedFetch(`${API_BASE_URL}/api/recipes/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, steps: JSON.parse(steps || '[]'), images })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setStatus(`Submitted! Share token: ${data.shareToken || 'pending approval'}`);
      else setStatus(data.error || 'Error');
    } catch (err: any) {
      setStatus(err?.message || 'Error');
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold mb-4">Submit a recipe</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Title</label>
          <input className="w-full border rounded px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea className="w-full border rounded px-3 py-2" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Steps (JSON array)</label>
          <textarea className="w-full border rounded px-3 py-2 font-mono text-sm" rows={6} value={steps} onChange={e => setSteps(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Images</label>
          <input type="file" accept="image/*" onChange={e => e.target.files && onUploadImage(e.target.files[0])} />
          <div className="flex gap-2 mt-2 flex-wrap">
            {images.map((src, idx) => (
              <img key={idx} src={src} className="h-20 w-20 object-cover rounded border" />
            ))}
          </div>
        </div>
        <button className="px-4 py-2 rounded bg-gray-900 text-white">Submit</button>
        <div className="text-sm text-gray-700">{status}</div>
      </form>
    </div>
  );
};