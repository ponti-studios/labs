import { Input } from '~/components/ui/input';
import { Slider } from '~/components/ui/slider';

interface GlassBackgroundControlsProps {
  glassGradient: {
    direction: string;
    startColor: string;
    startOpacity: number;
    endColor: string;
    endOpacity: number;
  };
  onGlassGradientChange: (gradient: {
    direction: string;
    startColor: string;
    startOpacity: number;
    endColor: string;
    endOpacity: number;
  }) => void;
}

const GRADIENT_DIRECTIONS = [
  { value: 'to bottom right', label: 'Bottom Right' },
  { value: 'to bottom', label: 'Bottom' },
  { value: 'to right', label: 'Right' },
  { value: 'to top right', label: 'Top Right' },
  { value: 'to top', label: 'Top' },
  { value: 'to top left', label: 'Top Left' },
  { value: 'to left', label: 'Left' },
  { value: 'to bottom left', label: 'Bottom Left' },
];

export function GlassBackgroundControls({
  glassGradient,
  onGlassGradientChange,
}: GlassBackgroundControlsProps) {
  const updateGradient = (updates: Partial<typeof glassGradient>) => {
    onGlassGradientChange({ ...glassGradient, ...updates });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="glass-direction" className="block text-sm font-medium">
          Gradient Direction
        </label>
        <select
          id="glass-direction"
          value={glassGradient.direction}
          onChange={(e) => updateGradient({ direction: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
        >
          {GRADIENT_DIRECTIONS.map((dir) => (
            <option key={dir.value} value={dir.value}>
              {dir.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="glass-start-color" className="block text-sm font-medium">
          Start Color
        </label>
        <div className="flex gap-2">
          <Input
            id="glass-start-color"
            type="color"
            value={glassGradient.startColor}
            onChange={(e) => updateGradient({ startColor: e.target.value })}
            className="w-12 h-10"
          />
          <Input
            type="text"
            value={glassGradient.startColor}
            onChange={(e) => updateGradient({ startColor: e.target.value })}
            placeholder="#ffffff"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="glass-start-opacity" className="block text-sm font-medium">
          Start Opacity ({Math.round(glassGradient.startOpacity * 100)}%)
        </label>
        <Slider
          id="glass-start-opacity"
          value={[glassGradient.startOpacity * 100]}
          onValueChange={(value) => updateGradient({ startOpacity: value[0] / 100 })}
          min={0}
          max={100}
          step={1}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="glass-end-color" className="block text-sm font-medium">
          End Color
        </label>
        <div className="flex gap-2">
          <Input
            id="glass-end-color"
            type="color"
            value={glassGradient.endColor}
            onChange={(e) => updateGradient({ endColor: e.target.value })}
            className="w-12 h-10"
          />
          <Input
            type="text"
            value={glassGradient.endColor}
            onChange={(e) => updateGradient({ endColor: e.target.value })}
            placeholder="#ffffff"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="glass-end-opacity" className="block text-sm font-medium">
          End Opacity ({Math.round(glassGradient.endOpacity * 100)}%)
        </label>
        <Slider
          id="glass-end-opacity"
          value={[glassGradient.endOpacity * 100]}
          onValueChange={(value) => updateGradient({ endOpacity: value[0] / 100 })}
          min={0}
          max={100}
          step={1}
        />
      </div>
    </div>
  );
}
