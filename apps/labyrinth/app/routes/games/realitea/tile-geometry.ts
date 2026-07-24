export interface Point {
  x: number;
  y: number;
}

const TAU = Math.PI * 2;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundedSegmentLength(width: number, height: number, radius: number): number {
  return 2 * (width - 2 * radius) + 2 * (height - 2 * radius) + TAU * radius;
}

function pointAtDistance(distance: number, width: number, height: number, radius: number): Point {
  const top = width - 2 * radius;
  const corner = (Math.PI * radius) / 2;
  const right = height - 2 * radius;
  const bottom = top;
  const left = right;
  const segments = [top, corner, right, corner, bottom, corner, left, corner];
  let remaining =
    ((distance % roundedSegmentLength(width, height, radius)) +
      roundedSegmentLength(width, height, radius)) %
    roundedSegmentLength(width, height, radius);

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    if (remaining > segment && index < segments.length - 1) {
      remaining -= segment;
      continue;
    }

    switch (index) {
      case 0:
        return { x: radius + remaining, y: 0 };
      case 1: {
        const angle = -Math.PI / 2 + remaining / radius;
        return {
          x: width - radius + radius * Math.cos(angle),
          y: radius + radius * Math.sin(angle),
        };
      }
      case 2:
        return { x: width, y: radius + remaining };
      case 3: {
        const angle = remaining / radius;
        return {
          x: width - radius + radius * Math.cos(angle),
          y: height - radius + radius * Math.sin(angle),
        };
      }
      case 4:
        return { x: width - radius - remaining, y: height };
      case 5: {
        const angle = Math.PI / 2 + remaining / radius;
        return {
          x: radius + radius * Math.cos(angle),
          y: height - radius + radius * Math.sin(angle),
        };
      }
      case 6:
        return { x: 0, y: height - radius - remaining };
      default: {
        const angle = Math.PI + remaining / radius;
        return { x: radius + radius * Math.cos(angle), y: radius + radius * Math.sin(angle) };
      }
    }
  }

  return { x: radius, y: 0 };
}

/**
 * Returns evenly spaced points around an inset rounded rectangle. The half-step
 * offset keeps bulbs away from the seams where straight edges meet corners.
 */
export function getRoundedPerimeterPoints(
  width: number,
  height: number,
  radius: number,
  targetSpacing: number,
): Point[] {
  const safeWidth = Math.max(0, width);
  const safeHeight = Math.max(0, height);
  const maxRadius = Math.min(safeWidth, safeHeight) / 2;
  const safeRadius = clamp(radius, 0, maxRadius);

  if (safeWidth <= 0 || safeHeight <= 0 || targetSpacing <= 0) return [];

  const perimeter = roundedSegmentLength(safeWidth, safeHeight, safeRadius);
  const count = Math.max(4, Math.round(perimeter / targetSpacing));
  const spacing = perimeter / count;
  const start = spacing / 2;

  return Array.from({ length: count }, (_, index) =>
    pointAtDistance(start + index * spacing, safeWidth, safeHeight, safeRadius),
  );
}

export function getRealiteaBulbInset(tileSize: number): number {
  return clamp(tileSize * 0.07, 4, 6);
}
