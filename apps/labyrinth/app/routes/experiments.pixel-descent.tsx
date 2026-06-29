export function meta() {
  return [{ title: "Pixel Descent | Labyrinth" }];
}

export default function PixelDescentRoute() {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      <div className="flex items-end justify-between gap-4 px-1">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pixel Descent</h1>
          <p className="text-muted-foreground text-sm">
            A static p5 sketch running inside the labyrinth shell.
          </p>
        </div>
      </div>
    </section>
  );
}
