// pixel-descent.js — Entry point for <pixel-descent-app> custom element
// Imports sub-modules for palettes, walker, and scene drawing.

import { W, H } from "./pixel-descent/palettes.js";
import { createWalker } from "./pixel-descent/walker.js";
import { drawStaticScene, drawEntranceOverlay } from "./pixel-descent/scene.js";

class PixelDescentApp extends HTMLElement {
  constructor() {
    super();

    this.params = {
      seed: 19301,
      crowdDensity: 900,
      walkSpeed: 1.0,
      pixelScale: 4,
      funnelSpread: 0.6,
      eraGrit: 0.35,
    };

    this.defaultParams = { ...this.params };

    // p5-owned state — populated during initP5
    this.walkers = [];
    this.pg = null;
    this._sk = null;

    this._initialized = false;
  }

  // ---- Lifecycle ----

  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    this.render();
    this.bindEvents();
    this.updateSeedDisplay();
    this.initP5();
  }

  // ---- DOM rendering ----

  render() {
    this.innerHTML = `
      <div class="container">
        <div class="sidebar">
          <h1>Pixel Descent</h1>
          <p class="subtitle">A million souls in fedoras and briefcases pour into the IRT, seen from a drone eye above — 1930s 8-bit isometric NYC.</p>

          <div class="control-section">
            <h3>Seed</h3>
            <input class="seed-input" type="number" id="seed-input" value="19301" min="1">
            <div class="button-row gr-cols-3">
              <button class="btn btn-icon" data-action="random-seed" aria-label="Random seed">🎲</button>
              <button class="btn btn-icon btn-primary" data-action="regenerate" aria-label="Regenerate">↻</button>
              <button class="btn btn-icon" data-action="download" aria-label="Download PNG">⬇</button>
            </div>
          </div>

          <div class="control-section">
            <h3>Parameters</h3>
            <div class="control-group">
              <label>Crowd Density</label>
              <div class="slider-container">
                <input type="range" id="crowdDensity" min="200" max="1800" step="50" value="900">
                <span class="value-display" id="crowdDensity-value">900</span>
              </div>
            </div>
            <div class="control-group">
              <label>Walk Speed</label>
              <div class="slider-container">
                <input type="range" id="walkSpeed" min="0.3" max="3.0" step="0.1" value="1.0">
                <span class="value-display" id="walkSpeed-value">1.0</span>
              </div>
            </div>
            <div class="control-group">
              <label>Pixel Scale</label>
              <div class="slider-container">
                <input type="range" id="pixelScale" min="2" max="6" step="1" value="4">
                <span class="value-display" id="pixelScale-value">4</span>
              </div>
            </div>
            <div class="control-group">
              <label>Funnel Spread</label>
              <div class="slider-container">
                <input type="range" id="funnelSpread" min="0.2" max="1.0" step="0.05" value="0.6">
                <span class="value-display" id="funnelSpread-value">0.6</span>
              </div>
            </div>
            <div class="control-group">
              <label>Era Grit (noise)</label>
              <div class="slider-container">
                <input type="range" id="eraGrit" min="0" max="1" step="0.05" value="0.35">
                <span class="value-display" id="eraGrit-value">0.35</span>
              </div>
            </div>
          </div>

        </div>

        <div class="canvas-area">
          <div id="canvas-container"></div>
        </div>
      </div>
    `;
  }

  // ---- Event binding ----

  bindEvents() {
    // Seed buttons
    this.querySelector('[data-action="random-seed"]')?.addEventListener("click", () =>
      this.randomSeed(),
    );

    // Seed input
    this.querySelector("#seed-input")?.addEventListener("change", () => this.jumpToSeed());

    // Action buttons
    this.querySelector('[data-action="regenerate"]')?.addEventListener("click", () =>
      this.regenerate(),
    );

    this.querySelector('[data-action="download"]')?.addEventListener("click", () =>
      this.downloadPNG(),
    );

    // Sliders
    const sliderIds = ["crowdDensity", "walkSpeed", "pixelScale", "funnelSpread", "eraGrit"];
    for (const id of sliderIds) {
      this.querySelector(`#${id}`)?.addEventListener("input", (e) => {
        this.updateParam(id, parseFloat(e.target.value));
      });
    }
  }

  // ---- Parameter helpers ----

  updateParam(name, val) {
    this.params[name] = val;
    const display = this.querySelector(`#${name}-value`);
    if (display) display.textContent = String(val);

    if (name === "crowdDensity" || name === "pixelScale" || name === "funnelSpread") {
      this.regenerate();
    }
  }

  updateSeedDisplay() {
    const input = this.querySelector("#seed-input");
    if (input) input.value = this.params.seed;
  }

  randomSeed() {
    this.params.seed = Math.floor(Math.random() * 999999) + 1;
    this.updateSeedDisplay();
    this.regenerate();
  }

  jumpToSeed() {
    const input = this.querySelector("#seed-input");
    const v = input ? parseInt(input.value) : 0;
    if (v > 0) {
      this.params.seed = v;
      this.regenerate();
    } else {
      this.updateSeedDisplay();
    }
  }

  downloadPNG() {
    if (this._sk) {
      this._sk.saveCanvas("pixel_descent", "png");
    }
  }

  // ---- Regenerate (reset walkers & static scene) ----

  regenerate() {
    if (!this._sk || !this._spawnWalker || !this._drawStaticScene) return;

    const sk = this._sk;
    sk.randomSeed(this.params.seed);
    sk.noiseSeed(this.params.seed);

    this.walkers = [];
    this.pg = sk.createGraphics(W, H);
    this._drawStaticScene(this.pg);

    for (let i = 0; i < this.params.crowdDensity; i++) {
      this._spawnWalker(true);
    }
  }

  // ---- p5.js sketch ----

  initP5() {
    const app = this;

    new p5(function (sk) {
      app._sk = sk;

      // Perlin-noise wrapper (needs p5 instance)
      function noise(t) {
        return sk.noise(t);
      }

      // Deps passed to each Walker at construction time
      const walkerDeps = { sk, noise, params: app.params };

      // Expose spawn on app so regenerate() can call it
      app._spawnWalker = function (scatter) {
        app.walkers.push(createWalker(scatter, app.params, sk, walkerDeps));
      };

      // Expose static-scene draw so regenerate() can render the background
      app._drawStaticScene = function (g) {
        drawStaticScene(g, app.params);
      };

      // ---- p5 lifecycle hooks ----

      sk.setup = function () {
        const cnv = sk.createCanvas(W, H);
        cnv.parent(app.querySelector("#canvas-container"));
        sk.colorMode(sk.RGB);
        app.regenerate();
      };

      sk.draw = function () {
        sk.image(app.pg, 0, 0);

        const ps = app.params.pixelScale;
        const speed = app.params.walkSpeed;

        // Painters algorithm: sort by screen-y
        app.walkers.sort((a, b) => a.sy - b.sy);

        for (const w of app.walkers) {
          w.update(speed);
          w.drawSprite(sk, ps);
        }

        // Top-up walkers if population drops below target
        sk.randomSeed(sk.frameCount * 7 + app.params.seed);
        if (app.walkers.length < app.params.crowdDensity && sk.random() < 0.35) {
          app._spawnWalker(false);
        }

        drawEntranceOverlay(sk);
      };
    });
  }
}

// Register the custom element
customElements.define("pixel-descent-app", PixelDescentApp);
