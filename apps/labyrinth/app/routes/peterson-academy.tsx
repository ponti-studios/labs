import { useState, type JSX } from "react";

interface CarouselItem {
  name: string;
}

function createInitialItems(): CarouselItem[] {
  return Array.from({ length: 6 }, (_, index) => ({ name: `Image ${index}` }));
}

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
            style={{
              width: "300px",
              height: "400px",
              border: "1px solid black",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: index * 70 + 20,
            }}
          >
            {item.name}
          </div>
        ))}
      </main>
      <div className="flex justify-center gap-8" style={{ marginTop: "1rem" }}>
        <button type="button" className="btn" onClick={handleLeftClick}>
          Left
        </button>
        <button type="button" className="btn" onClick={handleRightClick}>
          Right
        </button>
      </div>
    </div>
  );
}
