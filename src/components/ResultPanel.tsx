import React, { useState } from 'react';
import { Download, Loader2, ImageIcon, Maximize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export interface SimilarityScores {
  composition: number;
  shape: number;
  detail: number;
  overall: number;
  summary: string;
}

interface ResultPanelProps {
  imageUrl: string | null;
  isLoading: boolean;
  onDownload: () => void;
  similarityScores?: SimilarityScores | null;
  isAnalyzing?: boolean;
}

const ScoreBar: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  const getColor = (v: number) => {
    if (v >= 80) return 'text-green-400';
    if (v >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-mono font-semibold", getColor(value))}>{value}%</span>
      </div>
      <Progress value={value} className="h-1.5" />
    </div>
  );
};

const ResultPanel: React.FC<ResultPanelProps> = ({
  imageUrl,
  isLoading,
  onDownload,
  similarityScores,
  isAnalyzing,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      <div className="glass-panel rounded-xl p-4 flex flex-col gap-4 h-full animate-fade-in">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Result</span>
          {imageUrl && (
            <div className="flex gap-1">
              <Button variant="ghost" size="iconSm" onClick={() => setIsFullscreen(true)} title="Full Screen">
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="iconSm" onClick={onDownload} title="Download">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        <div className={cn(
          'flex-1 rounded-lg overflow-hidden flex items-center justify-center min-h-[300px]',
          'bg-secondary/30 border border-border/50'
        )}>
          {isLoading ? (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm">Generating image...</span>
            </div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt="Generated"
              className="w-full h-full object-contain animate-scale-in cursor-pointer"
              onClick={() => setIsFullscreen(true)}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <ImageIcon className="h-12 w-12 opacity-30" />
              <span className="text-sm">Your generated image will appear here</span>
            </div>
          )}
        </div>

        {/* Similarity Scores */}
        {isAnalyzing && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Analyzing accuracy...
          </div>
        )}
        {similarityScores && !isAnalyzing && (
          <div className="space-y-3 border-t border-border/50 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Accuracy Score</span>
              <span className={cn(
                "text-lg font-bold font-mono",
                similarityScores.overall >= 80 ? "text-green-400" :
                similarityScores.overall >= 60 ? "text-yellow-400" : "text-red-400"
              )}>
                {similarityScores.overall}%
              </span>
            </div>
            <div className="space-y-2">
              <ScoreBar label="Composition" value={similarityScores.composition} />
              <ScoreBar label="Shape" value={similarityScores.shape} />
              <ScoreBar label="Detail" value={similarityScores.detail} />
            </div>
            <p className="text-xs text-muted-foreground italic">{similarityScores.summary}</p>
          </div>
        )}
      </div>

      {/* Fullscreen Overlay */}
      {isFullscreen && imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center animate-fade-in"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="outline" size="iconSm" onClick={(e) => { e.stopPropagation(); onDownload(); }} title="Download">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="iconSm" onClick={() => setIsFullscreen(false)} title="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <img
            src={imageUrl}
            alt="Generated Full Screen"
            className="w-auto h-auto max-w-[90vw] max-h-[85vh] object-contain animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default ResultPanel;
