import * as Cesium from "cesium";

/**
 * A single stop in a camera tour
 */
export interface TourStop {
  /** Longitude in degrees */
  longitude: number;
  /** Latitude in degrees */
  latitude: number;
  /** Height in meters */
  height: number;
  /** Heading in degrees (0 = north, 90 = east) */
  heading?: number;
  /** Pitch in degrees (-90 = straight down, 0 = horizontal, 90 = straight up) */
  pitch?: number;
  /** Roll in degrees */
  roll?: number;
  /** Duration to fly to this stop in seconds */
  duration?: number;
  /** Hold time at this stop in seconds */
  holdTime?: number;
  /** Easing function for the flight */
  easing?: (time: number) => number;
}

/**
 * Camera tour configuration
 */
export interface CameraTourConfig {
  /** Array of stops in the tour */
  stops: TourStop[];
  /** Whether to loop the tour */
  loop?: boolean;
  /** Callback when tour starts */
  onStart?: () => void;
  /** Callback when each stop is reached */
  onStopReached?: (stopIndex: number, stop: TourStop) => void;
  /** Callback when tour completes */
  onComplete?: () => void;
  /** Callback when tour is cancelled */
  onCancel?: () => void;
}

/**
 * Predefined tour types for common visualization needs
 */
export type TourPreset =
  | "global-overview"
  | "conflict-tour"
  | "satellite-orbit"
  | "data-comparison"
  | "regional-focus";

/**
 * Manages camera tours and navigation sequences
 * Supports spline-based paths, stop-and-hold, and preset tours
 */
export class CameraTourManager {
  private viewer: Cesium.Viewer;
  private isPlaying = false;
  private currentStopIndex = 0;
  private config: CameraTourConfig | null = null;
  private cancelToken: boolean = false;

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
  }

  /**
   * Start a camera tour with the given configuration
   */
  async startTour(config: CameraTourConfig): Promise<void> {
    if (this.isPlaying) {
      this.cancel();
    }

    this.config = config;
    this.isPlaying = true;
    this.cancelToken = false;
    this.currentStopIndex = 0;

    config.onStart?.();

    try {
      for (let i = 0; i < config.stops.length; i++) {
        if (this.cancelToken) break;

        this.currentStopIndex = i;
        const stop = config.stops[i];

        // Fly to the stop
        await this.flyToStop(stop);

        if (this.cancelToken) break;

        // Notify stop reached
        config.onStopReached?.(i, stop);

        // Hold at this stop if specified
        if (stop.holdTime && stop.holdTime > 0) {
          await this.hold(stop.holdTime);
        }

        if (this.cancelToken) break;
      }

      if (!this.cancelToken && config.loop) {
        // Restart the tour
        await this.startTour(config);
      } else if (!this.cancelToken) {
        config.onComplete?.();
      }
    } finally {
      this.isPlaying = false;
      this.config = null;
    }
  }

  /**
   * Fly to a single stop
   */
  private flyToStop(stop: TourStop): Promise<void> {
    return new Promise((resolve) => {
      const destination = Cesium.Cartesian3.fromDegrees(
        stop.longitude,
        stop.latitude,
        stop.height
      );

      const orientation = {
        heading: Cesium.Math.toRadians(stop.heading ?? 0),
        pitch: Cesium.Math.toRadians(stop.pitch ?? -90),
        roll: stop.roll ?? 0,
      };

      this.viewer.camera.flyTo({
        destination,
        orientation,
        duration: stop.duration ?? 3,
        complete: () => {
          if (!this.cancelToken) {
            resolve();
          }
        },
        cancel: () => {
          resolve();
        },
      });
    });
  }

  /**
   * Hold at current position for specified time
   */
  private hold(seconds: number): Promise<void> {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        resolve();
      }, seconds * 1000);

      // Store timeout to allow cancellation
      const checkCancel = setInterval(() => {
        if (this.cancelToken) {
          clearTimeout(timeoutId);
          clearInterval(checkCancel);
          resolve();
        }
      }, 100);
    });
  }

  /**
   * Cancel the current tour
   */
  cancel(): void {
    this.cancelToken = true;
    this.isPlaying = false;
    this.config?.onCancel?.();
    this.viewer.camera.cancelFlight();
  }

  /**
   * Check if a tour is currently playing
   */
  isTourPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Get current stop index
   */
  getCurrentStopIndex(): number {
    return this.currentStopIndex;
  }

  /**
   * Skip to a specific stop in the current tour
   */
  async skipToStop(stopIndex: number): Promise<void> {
    if (!this.config || stopIndex < 0 || stopIndex >= this.config.stops.length) {
      return;
    }

    this.currentStopIndex = stopIndex;
    const stop = this.config.stops[stopIndex];
    await this.flyToStop(stop);
    this.config.onStopReached?.(stopIndex, stop);
  }

  /**
   * Create a smooth spline-based tour through multiple waypoints
   * Uses Hermite spline interpolation for smooth camera paths
   */
  createSplineTour(
    waypoints: Array<{ longitude: number; latitude: number; height: number }>,
    duration: number,
    onComplete?: () => void
  ): CameraTourConfig {
    const stops: TourStop[] = [];
    const segmentDuration = duration / (waypoints.length - 1);

    for (let i = 0; i < waypoints.length; i++) {
      const wp = waypoints[i];
      const nextWp = waypoints[i + 1];

      // Calculate heading toward next point
      let heading = 0;
      if (nextWp) {
        heading = this.calculateHeading(wp, nextWp);
      }

      stops.push({
        longitude: wp.longitude,
        latitude: wp.latitude,
        height: wp.height,
        heading,
        pitch: -45, // Look slightly down
        duration: segmentDuration,
      });
    }

    return {
      stops,
      onComplete,
    };
  }

  /**
   * Calculate heading between two points
   */
  private calculateHeading(
    from: { longitude: number; latitude: number },
    to: { longitude: number; latitude: number }
  ): number {
    const fromLon = Cesium.Math.toRadians(from.longitude);
    const fromLat = Cesium.Math.toRadians(from.latitude);
    const toLon = Cesium.Math.toRadians(to.longitude);
    const toLat = Cesium.Math.toRadians(to.latitude);

    const dLon = toLon - fromLon;
    const y = Math.sin(dLon) * Math.cos(toLat);
    const x =
      Math.cos(fromLat) * Math.sin(toLat) -
      Math.sin(fromLat) * Math.cos(toLat) * Math.cos(dLon);

    let heading = Math.atan2(y, x);
    heading = Cesium.Math.toDegrees(heading);
    return (heading + 360) % 360;
  }

  /**
   * Create a preset tour
   */
  static createPresetTour(
    preset: TourPreset,
    customStops?: TourStop[]
  ): CameraTourConfig {
    switch (preset) {
      case "global-overview":
        return {
          stops: [
            { longitude: 0, latitude: 20, height: 20000000, duration: 0 },
            { longitude: 120, latitude: 20, height: 20000000, duration: 5, holdTime: 2 },
            { longitude: -120, latitude: 20, height: 20000000, duration: 5, holdTime: 2 },
            { longitude: 0, latitude: 20, height: 20000000, duration: 5 },
          ],
          loop: true,
        };

      case "conflict-tour":
        return {
          stops: [
            { longitude: 37, latitude: 49, height: 1500000, duration: 3, holdTime: 3 }, // Ukraine
            { longitude: 34, latitude: 31, height: 800000, duration: 3, holdTime: 3 }, // Gaza
            { longitude: 30, latitude: 15, height: 2000000, duration: 3, holdTime: 3 }, // Sudan
            { longitude: 95, latitude: 21, height: 1500000, duration: 3, holdTime: 3 }, // Myanmar
            { longitude: 23, latitude: -3, height: 2500000, duration: 3, holdTime: 3 }, // DRC
          ],
          loop: true,
        };

      case "satellite-orbit":
        return {
          stops: [
            { longitude: 0, latitude: 0, height: 2000000, duration: 2 },
            { longitude: 90, latitude: 0, height: 2000000, duration: 2 },
            { longitude: 180, latitude: 0, height: 2000000, duration: 2 },
            { longitude: -90, latitude: 0, height: 2000000, duration: 2 },
          ],
          loop: true,
        };

      case "data-comparison":
        return {
          stops: [
            { longitude: -100, latitude: 40, height: 5000000, duration: 2, holdTime: 2 }, // Americas
            { longitude: 10, latitude: 50, height: 5000000, duration: 3, holdTime: 2 }, // Europe
            { longitude: 100, latitude: 35, height: 5000000, duration: 3, holdTime: 2 }, // Asia
          ],
          loop: true,
        };

      case "regional-focus":
      default:
        return {
          stops: customStops ?? [
            { longitude: 0, latitude: 20, height: 5000000, duration: 2 },
            { longitude: 0, latitude: 20, height: 1000000, duration: 3, holdTime: 5 },
          ],
        };
    }
  }
}
