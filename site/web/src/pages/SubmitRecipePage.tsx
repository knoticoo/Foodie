import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChefHat, 
  Upload, 
  Plus, 
  Minus, 
  Clock, 
  Users, 
  Camera,
  Save,
  AlertCircle,
  CheckCircle,
  X,
  Image as ImageIcon,
  Utensils
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { cn } from '../lib/utils';

const defaultApiBase = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:3000`
  : 'http://127.0.0.1:3000';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? defaultApiBase;

type Ingredient = { name: string; quantity?: number | string; unit?: string };
type Step = { text: string; image?: string | null };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const categories = [
  { value: 'breakfast', label: 'Brokastis', emoji: '🌅' },
  { value: 'lunch', label: 'Pusdienas', emoji: '🍽️' },
  { value: 'dinner', label: 'Vakariņas', emoji: '🌃' },
  { value: 'dessert', label: 'Deserti', emoji: '🍰' },
  { value: 'appetizer', label: 'Uzkodas', emoji: '🥗' },
  { value: 'snack', label: 'Našķi', emoji: '🍿' },
];

const difficulties = [
  { value: 'easy', label: 'Viegla', color: 'text-green-600', bgColor: 'bg-green-50' },
  { value: 'medium', label: 'Vidēja', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  { value: 'hard', label: 'Sarežģīta', color: 'text-red-600', bgColor: 'bg-red-50' },
];

const units = ['g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'gab', 'šķipsna'];

export const SubmitRecipePage: React.FC = () => {
  const { token, authorizedFetch } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState<'easy'|'medium'|'hard'>('easy');
  const [prepTime, setPrepTime] = useState<string>('');
  const [cookTime, setCookTime] = useState<string>('');
  const [servings, setServings] = useState<string>('4');
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', quantity: '', unit: 'g' }]);
  const [steps, setSteps] = useState<Step[]>([{ text: '' }]);
  const [images, setImages] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const dropRef = useRef<HTMLDivElement | null>(null);

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/20 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Nepieciešama autorizācija</h2>
          <p className="text-neutral-600 mb-6">Lai pievienotu recepti, jums ir jāpiesakās sistēmā.</p>
          <Button variant="gradient" onClick={() => window.location.href = '/login'}>
            Pieteikties
          </Button>
        </Card>
      </div>
    );
  }

  const uploadBase64 = async (dataUrl: string) => {
    try {
      const res = await authorizedFetch(`${API_BASE_URL}/api/uploads/image-base64`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl })
      });
      
      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      if (data.path) return data.path as string;
      throw new Error('No path returned from upload');
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Attēla augšupielāde neizdevās');
    }
  };

  const onUploadImage = async (file: File, attachToStepIdx?: number) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const path = await uploadBase64(String(reader.result));
          if (typeof attachToStepIdx === 'number') {
            setSteps(s => s.map((st, i) => i === attachToStepIdx ? { ...st, image: path } : st));
          } else {
            setImages(prev => prev.concat(path));
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Faila lasīšana neizdevās'));
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    for (const f of files) {
      if (f.type.startsWith('image/')) {
        try {
          await onUploadImage(f);
        } catch (error) {
          setStatus(`Attēla augšupielāde neizdevās: ${f.name}`);
        }
      }
    }
  };

  const addIngredient = () => {
    setIngredients(prev => [...prev, { name: '', quantity: '', unit: 'g' }]);
  };

  const removeIngredient = (idx: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== idx));
  };

  const updateIngredient = (idx: number, field: keyof Ingredient, value: string) => {
    setIngredients(prev => prev.map((ing, i) => 
      i === idx ? { ...ing, [field]: value } : ing
    ));
  };

  const addStep = () => {
    setSteps(prev => [...prev, { text: '' }]);
  };

  const removeStep = (idx: number) => {
    setSteps(prev => prev.filter((_, i) => i !== idx));
  };

  const updateStep = (idx: number, text: string) => {
    setSteps(prev => prev.map((step, i) => 
      i === idx ? { ...step, text } : step
    ));
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    setSuccess(false);

    try {
      const stepTexts = steps.map(s => s.text).filter(t => t.trim().length > 0);
      const allImages = images.concat(steps.map(s => s.image).filter(Boolean) as string[]);
      
      const totalTime = (Number(prepTime) || 0) + (Number(cookTime) || 0);
      
      const payload: any = {
        title: title.trim(),
        description: description.trim(),
        steps: stepTexts,
        images: allImages,
        servings: Number(servings) || 4
      };

      if (category) payload.category = category;
      if (difficulty) payload.difficulty = difficulty;
      if (totalTime > 0) payload.total_time_minutes = totalTime;
      if (prepTime) payload.prep_time_minutes = Number(prepTime);
      if (cookTime) payload.cook_time_minutes = Number(cookTime);
      
      const validIngredients = ingredients.filter(i => i.name && i.name.trim().length > 0);
      if (validIngredients.length > 0) payload.ingredients = validIngredients;

      const res = await authorizedFetch(`${API_BASE_URL}/api/recipes/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${res.status}`);
      }

      const data = await res.json();
      setSuccess(true);
      setStatus(`Recepte veiksmīgi pievienota! Dalīšanās kods: ${data.shareToken || 'gaida apstiprinājumu'}`);
      
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setDifficulty('easy');
      setPrepTime('');
      setCookTime('');
      setServings('4');
      setIngredients([{ name: '', quantity: '', unit: 'g' }]);
      setSteps([{ text: '' }]);
      setImages([]);
      
    } catch (err: any) {
      console.error('Submit error:', err);
      setStatus(err?.message || 'Kļūda pievienojot recepti');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl shadow-xl mb-4">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-display font-bold mb-2">
              <span className="text-gradient-primary">Pievienot</span>{' '}
              <span className="text-gradient-accent">Recepti</span>
            </h1>
            <p className="text-xl text-neutral-600">Dalieties ar savu kulināro radošumu</p>
          </motion.div>

          {/* Status Message */}
          <AnimatePresence>
            {status && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6"
              >
                <Card className={cn(
                  "p-4 border-l-4",
                  success 
                    ? "bg-green-50 border-green-400 text-green-700" 
                    : "bg-red-50 border-red-400 text-red-700"
                )}>
                  <div className="flex items-center gap-3">
                    {success ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <p>{status}</p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={onSubmit} className="space-y-8">
            {/* Basic Info */}
            <motion.div variants={itemVariants}>
              <Card className="p-6">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="flex items-center gap-2">
                    <Utensils className="w-5 h-5" />
                    Pamata informācija
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-6">
                  <Input
                    label="Receptes nosaukums *"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ievadiet receptes nosaukumu..."
                    required
                    animated
                  />

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Apraksts
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Īss receptes apraksts..."
                      rows={4}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Kategorija
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Izvēlieties kategoriju</option>
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.emoji} {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Sarežģītība
                      </label>
                      <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-100 rounded-lg">
                        {difficulties.map((diff) => (
                          <button
                            key={diff.value}
                            type="button"
                            onClick={() => setDifficulty(diff.value as any)}
                            className={cn(
                              "px-3 py-2 text-xs font-medium rounded-md transition-colors",
                              difficulty === diff.value
                                ? `${diff.bgColor} ${diff.color} shadow-sm`
                                : "text-neutral-600 hover:bg-neutral-200"
                            )}
                          >
                            {diff.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Input
                      label="Gatavošanas laiks (min)"
                      type="number"
                      value={prepTime}
                      onChange={(e) => setPrepTime(e.target.value)}
                      placeholder="30"
                      icon={<Clock className="w-4 h-4" />}
                    />

                    <Input
                      label="Cepšanas laiks (min)"
                      type="number"
                      value={cookTime}
                      onChange={(e) => setCookTime(e.target.value)}
                      placeholder="45"
                      icon={<Clock className="w-4 h-4" />}
                    />
                  </div>

                  <Input
                    label="Porciju skaits"
                    type="number"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    placeholder="4"
                    icon={<Users className="w-4 h-4" />}
                    className="md:w-48"
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Ingredients */}
            <motion.div variants={itemVariants}>
              <Card className="p-6">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Sastāvdaļas ({ingredients.filter(i => i.name.trim()).length})
                    </span>
                    <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                      <Plus className="w-4 h-4 mr-2" />
                      Pievienot
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  {ingredients.map((ingredient, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
                    >
                      <div className="md:col-span-6">
                        <Input
                          placeholder="Sastāvdaļas nosaukums"
                          value={ingredient.name}
                          onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                          required={idx === 0}
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Input
                          placeholder="Daudzums"
                          value={String(ingredient.quantity || '')}
                          onChange={(e) => updateIngredient(idx, 'quantity', e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <select
                          value={ingredient.unit || 'g'}
                          onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          {units.map(unit => (
                            <option key={unit} value={unit}>{unit}</option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-1">
                        {ingredients.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeIngredient(idx)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Steps */}
            <motion.div variants={itemVariants}>
              <Card className="p-6">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Gatavošanas soļi ({steps.filter(s => s.text.trim()).length})
                    </span>
                    <Button type="button" variant="outline" size="sm" onClick={addStep}>
                      <Plus className="w-4 h-4 mr-2" />
                      Pievienot soli
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-6">
                  {steps.map((step, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border border-neutral-200 rounded-lg"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {idx + 1}
                        </div>
                        <div className="flex-1 space-y-3">
                          <textarea
                            placeholder={`Aprakstiet ${idx + 1}. soli...`}
                            value={step.text}
                            onChange={(e) => updateStep(idx, e.target.value)}
                            rows={3}
                            required={idx === 0}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                          />
                          <div className="flex items-center gap-3">
                            {step.image && (
                              <img
                                src={step.image}
                                alt={`Solis ${idx + 1}`}
                                className="w-16 h-16 object-cover rounded-lg border"
                              />
                            )}
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => e.target.files && onUploadImage(e.target.files[0], idx)}
                                className="hidden"
                              />
                              <Button type="button" variant="outline" size="sm" as="span">
                                <Camera className="w-4 h-4 mr-2" />
                                {step.image ? 'Mainīt attēlu' : 'Pievienot attēlu'}
                              </Button>
                            </label>
                          </div>
                        </div>
                        {steps.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStep(idx)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Images */}
            <motion.div variants={itemVariants}>
              <Card className="p-6">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Papildu attēli ({images.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div
                    ref={dropRef}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors"
                  >
                    <Upload className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-600 mb-2">Velciet attēlus šeit vai</p>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          for (const f of files) {
                            try {
                              await onUploadImage(f);
                            } catch (error) {
                              setStatus(`Attēla augšupielāde neizdevās: ${f.name}`);
                            }
                          }
                        }}
                        className="hidden"
                      />
                      <Button type="button" variant="outline" as="span">
                        <Upload className="w-4 h-4 mr-2" />
                        Izvēlieties failus
                      </Button>
                    </label>
                  </div>

                  {images.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {images.map((src, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative group"
                        >
                          <img
                            src={src}
                            alt={`Attēls ${idx + 1}`}
                            className="w-full h-20 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={itemVariants} className="text-center">
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                loading={loading}
                disabled={!title.trim() || steps.filter(s => s.text.trim()).length === 0}
                icon={<Save className="w-5 h-5" />}
                className="px-12"
              >
                {loading ? 'Saglabā...' : 'Publicēt recepti'}
              </Button>
              <p className="text-sm text-neutral-500 mt-3">
                Pēc iesniegšanas recepte tiks pārskatīta pirms publicēšanas
              </p>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};