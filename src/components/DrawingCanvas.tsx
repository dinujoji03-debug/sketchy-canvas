import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface DrawingCanvasProps {
  brushColor: string;
  brushSize: number;
  tool: 'pen' | 'eraser';
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
  className?: string;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  brushColor,
  brushSize,
  tool,
  onCanvasReady,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Set initial canvas background to white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);

    setContext(ctx);
    onCanvasReady?.(canvas);
  }, [onCanvasReady]);

  const getCoordinates = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!context) return;
    
    const { x, y } = getCoordinates(e);
    
    context.beginPath();
    context.moveTo(x, y);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = brushSize;
    context.strokeStyle = tool === 'eraser' ? '#ffffff' : brushColor;
    
    setIsDrawing(true);
  }, [context, brushSize, brushColor, tool, getCoordinates]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !context) return;
    
    const { x, y } = getCoordinates(e);
    
    context.lineTo(x, y);
    context.stroke();
  }, [isDrawing, context, getCoordinates]);

  const stopDrawing = useCallback(() => {
    if (!context) return;
    context.closePath();
    setIsDrawing(false);
  }, [context]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !context) return;
    
    const rect = canvas.getBoundingClientRect();
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, rect.width, rect.height);
  }, [context]);

  // Expose clear method
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      (canvas as any).clearCanvas = clearCanvas;
    }
  }, [clearCanvas]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        'w-full h-full cursor-crosshair touch-none rounded-lg',
        className
      )}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
    />
  );
};

export default DrawingCanvas;
