import { useRef, useState } from 'react';
import { ImagePlus, X, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useAuth } from '@/hooks/useAuth';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, uploading } = useImageUpload();
  const { user } = useAuth();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadImage(file);
    if (url) {
      onChange(url);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput && urlInput.match(/^https?:\/\/.+/i)) {
      onChange(urlInput);
      setUrlInput('');
    }
  };

  const handleClear = () => {
    onChange(undefined);
    setUrlInput('');
  };

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2 text-foreground">
        <ImagePlus className="w-4 h-4 text-primary" />
        Event Image (optional)
      </Label>

      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Event preview"
            className="w-full max-h-64 object-contain rounded-xl border border-border bg-secondary/50"
            onError={() => onChange(undefined)}
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 p-1.5 bg-background/90 rounded-full hover:bg-background transition-colors border border-border"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`flex-1 py-2 px-3 text-sm rounded-lg border transition-colors ${
                mode === 'upload'
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-card border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              Upload
            </button>
            <button
              type="button"
              onClick={() => setMode('url')}
              className={`flex-1 py-2 px-3 text-sm rounded-lg border transition-colors ${
                mode === 'url'
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-card border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              URL
            </button>
          </div>

          {mode === 'upload' ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading || !user}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || !user}
                className="w-full h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-sm">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8" />
                    <span className="text-sm">
                      {user ? 'Click to upload image' : 'Sign in to upload'}
                    </span>
                    <span className="text-xs">Max 5MB</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="bg-card border-border focus:border-primary"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleUrlSubmit}
                disabled={!urlInput}
              >
                Add
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
