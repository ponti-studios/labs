import { Input } from '~/components/ui/input';

interface BackgroundSettingsProps {
  backgroundImage: string;
  backgroundColor: string;
  onBackgroundImageChange: (value: string) => void;
  onBackgroundColorChange: (value: string) => void;
}

export function BackgroundSettings({
  backgroundImage,
  backgroundColor,
  onBackgroundImageChange,
  onBackgroundColorChange,
}: BackgroundSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="background-image" className="block text-sm font-medium">
          Background Image URL
        </label>
        <Input
          id="background-image"
          type="url"
          value={backgroundImage}
          onChange={(e) => onBackgroundImageChange(e.target.value)}
          placeholder="Enter image URL..."
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="background-color" className="block text-sm font-medium">
          Background Color
        </label>
        <div className="flex gap-2">
          <Input
            id="background-color"
            type="color"
            value={backgroundColor}
            onChange={(e) => onBackgroundColorChange(e.target.value)}
            className="w-12 h-10"
          />
          <Input
            type="text"
            value={backgroundColor}
            onChange={(e) => onBackgroundColorChange(e.target.value)}
            placeholder="#000000"
          />
        </div>
      </div>
    </div>
  );
}
