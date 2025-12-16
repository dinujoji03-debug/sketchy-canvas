import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Pencil, Eraser, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  tool: 'pen' | 'eraser';
  setTool: (tool: 'pen' | 'eraser') => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  brushColor: string;
  setBrushColor: (color: string) => void;
  onClear: () => void;
}

const colors = [
  '#000000',
  '#374151',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
];

const Toolbar: React.FC<ToolbarProps> = ({
  tool,
  setTool,
  brushSize,
  setBrushSize,
  brushColor,
  setBrushColor,
  onClear,
}) => {
  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col gap-6 animate-fade-in">
      {/* Tools */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tools</span>
        <div className="flex gap-2">
          <Button
            variant={tool === 'pen' ? 'toolActive' : 'tool'}
            size="icon"
            onClick={() => setTool('pen')}
            title="Pen"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant={tool === 'eraser' ? 'toolActive' : 'tool'}
            size="icon"
            onClick={() => setTool('eraser')}
            title="Eraser"
          >
            <Eraser className="h-4 w-4" />
          </Button>
          <Button
            variant="tool"
            size="icon"
            onClick={onClear}
            title="Clear Canvas"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Brush Size */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Size</span>
          <span className="text-xs text-muted-foreground">{brushSize}px</span>
        </div>
        <Slider
          value={[brushSize]}
          onValueChange={(value) => setBrushSize(value[0])}
          min={1}
          max={50}
          step={1}
          className="w-full"
        />
      </div>

      {/* Colors */}
      <div className="space-y-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Color</span>
        <div className="grid grid-cols-4 gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => setBrushColor(color)}
              className={cn(
                'w-8 h-8 rounded-lg transition-all duration-200 hover:scale-110',
                brushColor === color && 'ring-2 ring-primary ring-offset-2 ring-offset-card'
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
