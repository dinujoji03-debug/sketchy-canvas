import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Wand2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DrawingCanvas from '@/components/DrawingCanvas';
import Toolbar from '@/components/Toolbar';
import ResultPanel from '@/components/ResultPanel';
import UserHeader from '@/components/UserHeader';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user, loading, credits, refreshCredits } = useAuth();
  const navigate = useNavigate();
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [brushSize, setBrushSize] = useState(4);
  const [brushColor, setBrushColor] = useState('#000000');
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas;
  }, []);

  const handleClear = useCallback(() => {
    if (canvasRef.current && (canvasRef.current as any).clearCanvas) {
      (canvasRef.current as any).clearCanvas();
    }
    setUploadedImage(null);
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
      toast.success('Sketch uploaded!');
    };
    reader.onerror = () => toast.error('Failed to read file');
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleGenerate = async () => {
    if (!canvasRef.current) {
      toast.error('Canvas not ready');
      return;
    }
    if (credits !== null && credits <= 0) {
      toast.error('No credits remaining! Please add more credits.');
      return;
    }

    setIsGenerating(true);
    try {
      const sketchBase64 = canvasRef.current.toDataURL('image/png');
      toast.info('Generating your image...', { duration: 3000 });

      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt: prompt.trim() || 'Transform this sketch into a polished, detailed image',
          sketchBase64,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to generate image');
      }
      if (data?.error) throw new Error(data.error);

      if (data?.image) {
        setGeneratedImage(data.image);
        toast.success('Image generated successfully!');
        await refreshCredits();
      } else {
        throw new Error('No image returned');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.download = `sketch-to-image-${Date.now()}.png`;
    link.href = generatedImage;
    link.click();
    toast.success('Image downloaded!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-y-auto overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between mb-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Sketch to Image</h1>
              <p className="text-xs text-muted-foreground">Draw your idea, let AI bring it to life</p>
            </div>
          </div>
          <UserHeader />
        </header>

        {/* Main Content */}
        <div className="flex-1 grid lg:grid-cols-[1fr_280px_320px] gap-4 min-h-0">
          <div className="flex flex-col gap-4 min-h-0">
            <div className="glass-panel rounded-xl p-3 flex gap-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <Input
                placeholder="(Optional) Describe the image you want to generate..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-1 bg-secondary/50 border-border/50 focus:border-primary/50"
              />
              <Button
                variant="glow"
                onClick={handleGenerate}
                disabled={isGenerating || (credits !== null && credits <= 0)}
                className="min-w-[120px]"
              >
                {isGenerating ? (
                  <>Generating...</>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate
                  </>
                )}
              </Button>
            </div>

            <div
              className="flex-1 glass-panel rounded-xl p-2 min-h-[400px] animate-fade-in relative"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="w-full h-full bg-white rounded-lg overflow-hidden shadow-inner">
                <DrawingCanvas
                  brushColor={brushColor}
                  brushSize={brushSize}
                  tool={tool}
                  onCanvasReady={handleCanvasReady}
                  uploadedImage={uploadedImage}
                />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleUploadClick}
                className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Sketch
              </Button>
            </div>
          </div>

          <div className="lg:order-none order-first" style={{ animationDelay: '0.15s' }}>
            <Toolbar
              tool={tool}
              setTool={setTool}
              brushSize={brushSize}
              setBrushSize={setBrushSize}
              brushColor={brushColor}
              setBrushColor={setBrushColor}
              onClear={handleClear}
            />
          </div>

          <div style={{ animationDelay: '0.25s' }}>
            <ResultPanel
              imageUrl={generatedImage}
              isLoading={isGenerating}
              onDownload={handleDownload}
            />
          </div>
        </div>

        <footer className="mt-4 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="text-xs text-muted-foreground">
            Draw on the canvas, describe your vision, and click Generate to transform your sketch
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
