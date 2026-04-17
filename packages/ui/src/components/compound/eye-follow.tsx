import { useCallback, useEffect, useRef, useState } from "react";

const HEAD_SIZE = 100;
const HEAD_RADIUS = HEAD_SIZE / 2;

export function EyeFollow() {
  const [eyeRotation, setEyeRotation] = useState(0);
  const headRef = useRef<HTMLDivElement | null>(null);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!headRef.current) {
      return;
    }

    const headRect = headRef.current.getBoundingClientRect();
    const headPosition = {
      top: headRect.left + HEAD_RADIUS,
      left: headRect.top + HEAD_RADIUS,
    };

    const mouseDistanceFromTop = e.clientX;
    const mouseDistanceFromLeft = e.clientY;

    // The angle of the mouse position relative to the center of the head.
    const angle = Math.atan2(
      mouseDistanceFromLeft - headPosition.left,
      mouseDistanceFromTop - headPosition.top,
    );

    // Convert radians to degrees.
    const angleDegrees = (angle * 180) / Math.PI;

    // Set the eye rotation. Using 20 as a modifier to make the eyes look
    // at the center of cursor.
    setEyeRotation(angleDegrees - 20);
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", onMouseMove);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [onMouseMove]);

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div
        ref={headRef}
        className="flex h-25 w-25 items-center justify-center gap-6 rounded bg-red-500"
      >
        <div
          className="w-6 h-6 bg-white rounded-full"
          style={{ transform: `rotate(${eyeRotation}deg)`, position: "relative" }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              backgroundColor: "#000",
              borderRadius: "50%",
              position: "absolute",
              top: "50%",
              right: 0,
            }}
          />
        </div>
        <div
          className="w-6 h-6 bg-white rounded-full"
          style={{ transform: `rotate(${eyeRotation}deg)`, position: "relative" }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              backgroundColor: "#000",
              borderRadius: "50%",
              position: "absolute",
              top: "50%",
              right: 0,
            }}
          />
        </div>
      </div>
    </div>
  );
}
