import React, { useState, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Modal } from '../components/Modal';

const defaultApiBase = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:3000`
  : 'http://127.0.0.1:3000';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? defaultApiBase;

type Ingredient = { name: string; quantity?: number | string; unit?: string };

type Step = { text: string; image?: string | null };

export const SubmitRecipePage: React.FC = () => {
  const { token, authorizedFetch } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState<'easy'|'medium'|'hard'|' '>('easy');
  const [totalMinutes, setTotalMinutes] = useState<string>('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [steps, setSteps] = useState<Step[]>([{ text: '' }]);
  const [images, setImages] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const [isIngModalOpen, setIngModalOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement | null>(null);

  if (!token) return <div>Please login to submit a recipe.</div>;

  const uploadBase64 = async (dataUrl: string) => {
    const res = await authorizedFetch(`${API_BASE_URL}/api/uploads/image-base64`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl })
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.path) return data.path as string;
    throw new Error('Upload failed');
  };

  const onUploadImage = async (file: File, attachToStepIdx?: number) => {
    return new Promise<void>((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const path = await uploadBase64(String(reader.result));
          if (typeof attachToStepIdx === 'number') {
            setSteps(s => s.map((st, i) => i === attachToStepIdx ? { ...st, image: path } : st));
          } else {
            setImages(prev => prev.concat(path));
          }
        } catch {}
        resolve();
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    for (const f of files) await onUploadImage(f);
  };

  const addIngredientRow = () => setIngredients(prev => prev.concat({ name: '', quantity: '', unit: '' }));
  const removeIngredientRow = (idx: number) => setIngredients(prev => prev.filter((_, i) => i !== idx));

  const addStep = () => setSteps(prev => prev.concat({ text: '' }));
  const removeStep = (idx: number) => setSteps(prev => prev.filter((_, i) => i !== idx));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Submitting...');
    try {
      const stepTexts = steps.map(s => s.text).filter(t => t.trim().length > 0);
      const allImages = images.concat(steps.map(s => s.image).filter(Boolean) as string[]);
      const payload: any = {
        title,
        description,
        steps: stepTexts,
        images: allImages
      };
      if (category) payload.category = category;
      if (difficulty && difficulty.trim()) payload.difficulty = difficulty;
      if (totalMinutes && String(totalMinutes).trim()) payload.total_time_minutes = Number(totalMinutes);
      if (ingredients.length > 0) payload.ingredients = ingredients.filter(i => i.name && i.name.trim().length > 0);

      const res = await authorizedFetch(`${API_BASE_URL}/api/recipes/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setStatus(`Submitted! Share token: ${data.shareToken || 'pending approval'}`);
      else setStatus(data.error || 'Error');
    } catch (err: any) {
      setStatus(err?.message || 'Error');
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-4">Submit a recipe</h1>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input className="w-full border rounded px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Category</label>
            <select className="w-full border rounded px-3 py-2" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">Select</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="dessert">Dessert</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Difficulty</label>
            <select className="w-full border rounded px-3 py-2" value={difficulty} onChange={e => setDifficulty(e.target.value as any)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Total time (min)</label>
            <input className="w-full border rounded px-3 py-2" inputMode="numeric" value={totalMinutes} onChange={e => setTotalMinutes(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea className="w-full border rounded px-3 py-2" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm">Ingredients</label>
            <button type="button" onClick={() => setIngModalOpen(true)} className="text-sm text-blue-600 underline">Edit</button>
          </div>
          {ingredients.length === 0 ? (
            <div className="text-sm text-gray-600">No ingredients added.</div>
          ) : (
            <ul className="list-disc ml-6 text-sm text-gray-700">
              {ingredients.map((ing, i) => (
                <li key={i}>{ing.name} {ing.quantity ? `— ${ing.quantity}` : ''} {ing.unit || ''}</li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Steps</label>
          <div className="space-y-3">
            {steps.map((s, i) => (
              <div key={i} className="border rounded p-3">
                <div className="flex items-start gap-2">
                  <textarea className="flex-1 border rounded px-2 py-2 text-sm" rows={3} placeholder={`Step ${i+1}`} value={s.text} onChange={e => setSteps(prev => prev.map((st, idx) => idx === i ? { ...st, text: e.target.value } : st))} />
                  <div className="w-28 shrink-0">
                    {s.image ? (
                      <img src={s.image} alt="step" className="w-28 h-20 object-cover rounded border" />
                    ) : (
                      <label className="block text-xs text-gray-600 mb-1">Image</label>
                    )}
                    <input type="file" accept="image/*" onChange={e => e.target.files && onUploadImage(e.target.files[0], i)} className="text-xs" />
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <button type="button" onClick={() => removeStep(i)} className="text-xs text-red-600">Remove</button>
                  {i === steps.length - 1 && <button type="button" onClick={addStep} className="text-xs text-blue-600">Add step</button>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">General images</label>
          <div
            ref={dropRef}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            className="border rounded p-3 text-sm text-gray-600"
          >
            Drag & drop images here or use the file picker below.
          </div>
          <input type="file" accept="image/*" multiple onChange={async e => {
            const files = Array.from(e.target.files || []);
            for (const f of files) await onUploadImage(f);
          }} />
          <div className="flex gap-2 mt-2 flex-wrap">
            {images.map((src, idx) => (
              <img key={idx} src={src} className="h-20 w-20 object-cover rounded border" />
            ))}
          </div>
        </div>

        <button className="px-4 py-2 rounded bg-gray-900 text-white">Submit</button>
        <div className="text-sm text-gray-700">{status}</div>
      </form>

      <Modal isOpen={isIngModalOpen} title="Ingredients" onClose={() => setIngModalOpen(false)} footer={
        <>
          <button className="px-3 py-1 rounded bg-gray-200" onClick={() => setIngModalOpen(false)}>Done</button>
        </>
      }>
        <div className="space-y-3">
          {ingredients.map((ing, i) => (
            <div key={i} className="grid grid-cols-6 gap-2 items-center">
              <input className="col-span-3 border rounded px-2 py-1" placeholder="Name" value={ing.name} onChange={e => setIngredients(prev => prev.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} />
              <input className="col-span-1 border rounded px-2 py-1" placeholder="Qty" value={String(ing.quantity ?? '')} onChange={e => setIngredients(prev => prev.map((x, idx) => idx === i ? { ...x, quantity: e.target.value } : x))} />
              <input className="col-span-1 border rounded px-2 py-1" placeholder="Unit" value={ing.unit ?? ''} onChange={e => setIngredients(prev => prev.map((x, idx) => idx === i ? { ...x, unit: e.target.value } : x))} />
              <button className="col-span-1 text-red-600 text-sm" onClick={() => removeIngredientRow(i)} type="button">Remove</button>
            </div>
          ))}
          <button className="text-sm text-blue-600" type="button" onClick={addIngredientRow}>Add ingredient</button>
        </div>
      </Modal>
    </div>
  );
};