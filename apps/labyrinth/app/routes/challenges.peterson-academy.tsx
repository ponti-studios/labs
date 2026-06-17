import { Button } from "@pontistudios/ui";
import { useState, type JSX } from "react";

interface CarouselItem {
  name: string;
}

function createInitialItems(): CarouselItem[] {
  return Array.from({ length: 6 }, (_, index) => ({ name: `Image ${index}` }));
}

/**
 * Peterson Academy Take-Home Challenge
 *
 * Task: Build a React carousel component that supports infinite left and right
 * navigation through a list of images/items.
 */
export default function PetersonAcademy(): JSX.Element {
  const [items, setItems] = useState<CarouselItem[]>(createInitialItems);

  const handleLeftClick = (): void => {
    setItems((previousItems) => [...previousItems.slice(1), previousItems[0]]);
  };

  const handleRightClick = (): void => {
    setItems((previousItems) => {
      const itemCount = previousItems.length;
      return [previousItems[itemCount - 1], ...previousItems.slice(0, itemCount - 1)];
    });
  };

  return (
    <div>
      <h2>Peterson Academy</h2>
      <p>Image carousel with staggered layout.</p>
      <main className="flex gap-4 items-start overflow-x-auto pb-4">
        {items.map((item, index) => (
          <div
            key={item.name}
            style={{ marginTop: `${index * 50 + 10}px` }}
            className="shrink-0 w-40 h-56 border border-border rounded-lg flex items-center justify-center text-sm text-muted-foreground bg-muted/40 transition-all duration-300"
          >
            {item.name}
          </div>
        ))}
      </main>
      <div className="flex justify-center gap-8 mt-8">
        <Button type="button" onClick={handleLeftClick}>
          Left
        </Button>
        <Button type="button" onClick={handleRightClick}>
          Right
        </Button>
      </div>
    </div>
  );
}
