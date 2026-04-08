import { useMemo } from 'react';
import { Slider } from '~/components/ui/slider';

interface OpacityControlsProps {
  opacities: number[];
  onOpacityChange: (index: number, value: number) => void;
}

export function OpacityControls({ opacities, onOpacityChange }: OpacityControlsProps) {
  const opacityItems = useMemo(() => {
    return opacities.map((opacity, index) => ({
      id: `${index}-${opacity}`,
      value: opacity,
      originalIndex: index,
    }));
  }, [opacities]);

  const handleValueChange = (id: string, newValue: number) => {
    const item = opacityItems.find((item) => item.id === id);
    if (item) {
      onOpacityChange(item.originalIndex, newValue);
    }
  };

  return (
    <div className="space-y-4">
      {opacityItems.map((item) => (
        <div key={item.id} className="space-y-2">
          <label htmlFor={`opacity-${item.id}`} className="block text-sm font-medium">
            Color Stop {item.originalIndex + 1} Opacity ({Math.round(item.value * 100)}%)
          </label>
          <Slider
            id={`opacity-${item.id}`}
            value={[item.value * 100]}
            onValueChange={(value) => handleValueChange(item.id, value[0] / 100)}
            min={0}
            max={100}
            step={1}
          />
        </div>
      ))}
    </div>
  );
}
