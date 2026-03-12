import * as Cesium from "cesium";

/**
 * Scene mode options
 */
export type SceneMode = "3D" | "2D" | "Columbus";

/**
 * Manages scene mode switching and projection settings
 * Allows seamless transitions between 3D globe, 2D map, and Columbus view
 */
export class SceneModeManager {
  private viewer: Cesium.Viewer;
  private currentMode: SceneMode = "3D";

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
  }

  /**
   * Get the current scene mode
   */
  getCurrentMode(): SceneMode {
    return this.currentMode;
  }

  /**
   * Switch to 3D globe view
   */
  switchTo3D(duration: number = 2): void {
    if (this.currentMode === "3D") return;

    this.viewer.scene.morphTo3D(duration);
    this.currentMode = "3D";

    // Re-enable terrain if available
    if (this.viewer.terrainProvider) {
      this.viewer.scene.globe.depthTestAgainstTerrain = true;
    }
  }

  /**
   * Switch to 2D map view
   */
  switchTo2D(duration: number = 2): void {
    if (this.currentMode === "2D") return;

    this.viewer.scene.morphTo2D(duration);
    this.currentMode = "2D";

    // Disable terrain for 2D
    this.viewer.scene.globe.depthTestAgainstTerrain = false;
  }

  /**
   * Switch to Columbus view (3D on 2D plane)
   */
  switchToColumbus(duration: number = 2): void {
    if (this.currentMode === "Columbus") return;

    this.viewer.scene.morphToColumbusView(duration);
    this.currentMode = "Columbus";

    // Disable terrain for Columbus view
    this.viewer.scene.globe.depthTestAgainstTerrain = false;
  }

  /**
   * Toggle between 3D and 2D modes
   */
  toggle3D2D(duration: number = 2): void {
    if (this.currentMode === "3D") {
      this.switchTo2D(duration);
    } else {
      this.switchTo3D(duration);
    }
  }

  /**
   * Cycle through all three modes
   */
  cycleMode(duration: number = 2): SceneMode {
    const modes: SceneMode[] = ["3D", "2D", "Columbus"];
    const currentIndex = modes.indexOf(this.currentMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    const nextMode = modes[nextIndex];

    this.switchToMode(nextMode, duration);
    return nextMode;
  }

  /**
   * Switch to a specific mode by name
   */
  switchToMode(mode: SceneMode, duration: number = 2): void {
    switch (mode) {
      case "3D":
        this.switchTo3D(duration);
        break;
      case "2D":
        this.switchTo2D(duration);
        break;
      case "Columbus":
        this.switchToColumbus(duration);
        break;
    }
  }

  /**
   * Check if currently in 3D mode
   */
  is3D(): boolean {
    return this.currentMode === "3D";
  }

  /**
   * Check if currently in 2D mode
   */
  is2D(): boolean {
    return this.currentMode === "2D";
  }

  /**
   * Check if currently in Columbus view
   */
  isColumbus(): boolean {
    return this.currentMode === "Columbus";
  }

  /**
   * Save current view state for restoration after mode switch
   */
  saveViewState(): {
    position: Cesium.Cartesian3;
    heading: number;
    pitch: number;
    roll: number;
  } {
    const camera = this.viewer.camera;
    return {
      position: camera.position.clone(),
      heading: camera.heading,
      pitch: camera.pitch,
      roll: camera.roll,
    };
  }

  /**
   * Restore view state after mode switch
   */
  restoreViewState(state: {
    position: Cesium.Cartesian3;
    heading: number;
    pitch: number;
    roll: number;
  }): void {
    this.viewer.camera.setView({
      destination: state.position,
      orientation: {
        heading: state.heading,
        pitch: state.pitch,
        roll: state.roll,
      },
    });
  }

  /**
   * Preserve view when switching modes
   * Attempts to maintain the same visible area
   */
  switchModePreserveView(mode: SceneMode, duration: number = 2): void {
    // Save current rectangle visible
    const rect = this.viewer.camera.computeViewRectangle();

    this.switchToMode(mode, duration);

    // Restore view rectangle after morph completes
    if (rect) {
      setTimeout(() => {
        this.viewer.camera.flyTo({
          destination: rect,
          duration: 0,
        });
      }, duration * 1000 + 100);
    }
  }
}
