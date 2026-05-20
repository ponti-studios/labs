import { useState } from "react";

export default function PetersonAcademy() {
  const [els, setEls] = useState(
    new Array(6).fill(0).map((_, i) => ({ name: `Image ${i}` })),
  );

  const handleLeftClick = () => {
    setEls((prev) => {
      return [...prev.slice(1, prev.length), prev[0]];
    });
  };

  const handleRightClick = () => {
    setEls((prev) => {
      const len = prev.length;
      return [prev[len - 1], ...prev.slice(0, prev.length - 1)];
    });
  };

  return (
    <div>
      <h2>Peterson Academy</h2>
      <p>Image carousel with staggered layout.</p>
      <main className="flex gap-8">
        {els.map((el, i) => (
          <div
            key={el.name}
            style={{
              width: "300px",
              height: "400px",
              border: "1px solid black",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: i * 70 + 20,
            }}
          >
            {el.name}
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
