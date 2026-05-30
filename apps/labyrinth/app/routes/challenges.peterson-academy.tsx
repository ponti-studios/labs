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
      <main className="flex gap-8">
        {items.map((item, index) => (
          <div
            key={item.name}
            className={`col-span-1 w-[300px] h-[400px] border border-black flex items-center justify-center mt-[${index * 70 + 20}px]`}
          >
            {item.name}
          </div>
        ))}
      </main>
      <div className="flex justify-center gap-8 mt-4">
        <Button type="button" className="btn" onClick={handleLeftClick}>
          Left
        </Button>
        <Button type="button" className="btn" onClick={handleRightClick}>
          Right
        </Button>
      </div>
    </div>
  );
}
