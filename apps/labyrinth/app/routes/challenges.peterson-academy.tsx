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
      <main className="flex items-start gap-4 overflow-x-auto pb-4">
        {items.map((item, index) => (
          <div
            key={item.name}
            style={{ marginTop: `${index * 50 + 10}px` }}
            className="border text-muted-foreground bg-muted/40 flex h-56 w-40 shrink-0 items-center justify-center rounded-lg border text-sm transition-all duration-300"
          >
            {item.name}
          </div>
        ))}
      </main>
      <div className="mt-8 flex justify-center gap-8">
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
