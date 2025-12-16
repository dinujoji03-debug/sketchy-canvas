import React from 'react';
import { Download, Loader2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ResultPanelProps {
  imageUrl: string | null;
  isLoading: boolean;
  onDownload: () => void;
}

const ResultPanel: React.FC<ResultPanelProps> = ({
  imageUrl,
  isLoading,
  onDownload,
}) => {
  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col gap-4 h-full animate-fade-in">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Result</span>
        {imageUrl && (
          <Button
            variant="ghost"
            size="iconSm"
            onClick={onDownload}
            title="Download"
          >
            <Download className="h-4 w-4" />
          </Button>
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
            className="w-full h-full object-contain animate-scale-in"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <ImageIcon className="h-12 w-12 opacity-30" />
            <span className="text-sm">Your generated image will appear here</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultPanel;
