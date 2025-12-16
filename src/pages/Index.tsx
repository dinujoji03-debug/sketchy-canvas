import React, { useState, useRef, useCallback } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DrawingCanvas from '@/components/DrawingCanvas';
import Toolbar from '@/components/Toolbar';
import ResultPanel from '@/components/ResultPanel';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [brushSize, setBrushSize] = useState(4);
  const [brushColor, setBrushColor] = useState('#000000');
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas;
  }, []);

  const handleClear = useCallback(() => {
    if (canvasRef.current && (canvasRef.current as any).clearCanvas) {
      (canvasRef.current as any).clearCanvas();
    }
  }, []);

  const handleGenerate = async () => {
    if (!canvasRef.current) {
      toast.error('Canvas not ready');
      return;
    }

    if (!prompt.trim()) {
      toast.error('Please describe what you want to generate');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Get canvas data
      const sketchBase64 = canvasRef.current.toDataURL('image/png');
      
      toast.info('Generating your image...', { duration: 3000 });

      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { 
          prompt: prompt.trim(),
          sketchBase64 
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to generate image');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.image) {
        setGeneratedImage(data.image);
        toast.success('Image generated successfully!');
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

  return (
    <div className="min-h-screen bg-background relative overflow-y-auto overflow-x-hidden">
      {/* Background glow effects */}
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
        </header>

        {/* Main Content */}
        <div className="flex-1 grid lg:grid-cols-[1fr_280px_320px] gap-4 min-h-0">
          {/* Canvas Area */}
          <div className="flex flex-col gap-4 min-h-0">
            {/* Prompt Input */}
            <div className="glass-panel rounded-xl p-3 flex gap-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <Input
                placeholder="Describe the image you want to generate from your sketch..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-1 bg-secondary/50 border-border/50 focus:border-primary/50"
              />
              <Button
                variant="glow"
                onClick={handleGenerate}
                disabled={isGenerating}
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

            {/* Canvas */}
            <div 
              className="flex-1 glass-panel rounded-xl p-2 min-h-[400px] animate-fade-in"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="w-full h-full bg-white rounded-lg overflow-hidden shadow-inner">
                <DrawingCanvas
                  brushColor={brushColor}
                  brushSize={brushSize}
                  tool={tool}
                  onCanvasReady={handleCanvasReady}
                />
              </div>
            </div>
          </div>

          {/* Toolbar */}
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

          {/* Result Panel */}
          <div style={{ animationDelay: '0.25s' }}>
            <ResultPanel
              imageUrl={generatedImage}
              isLoading={isGenerating}
              onDownload={handleDownload}
            />
          </div>
        </div>

        {/* Footer hint */}
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
