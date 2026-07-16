// pixel-descent/walker.js — Walker class and createWalker factory

import {
  COAT_COLORS,
  HAT_COLORS,
  TROUSER_COLORS,
  SKIN_TONES,
  BRIEFCASE_COLORS,
  W,
  H,
} from "./palettes.js";

// ---- 8-bit commuter figure ----

export class Walker {
  /**
   * @param {object} deps - Shared dependencies: { sk, noise, params }
   */
  constructor(x, y, tx, ty, coat, hat, trouser, skin, brief, phase, deps) {
    this.x = x;
    this.y = y;
    this.tx = tx;
    this.ty = ty;
    this.coat = coat;
    this.hat = hat;
    this.trouser = trouser;
    this.skin = skin;
    this.brief = brief;
    this.phase = phase;
    this.alive = true;
    this.sy = y;
    this._deps = deps;
    this.drift = deps.sk.random(-0.3, 0.3);
    this.noiseOff = deps.sk.random(0, 1000);
  }

  update(speed) {
    const { sk, noise, params } = this._deps;
    const dx = this.tx - this.x;
    const dy = this.ty - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 8) {
      // Walker reached the entrance — respawn at top
      this.x = W / 2 + (Math.random() - 0.5) * W * params.funnelSpread * 0.5;
      this.y = Math.random() * -30 - 5;
      return;
    }

    const nx = dx / dist;
    const ny = dy / dist;

    const noiseStrength = params.eraGrit * Math.min(1, dist / 200);
    const angle = (noise(this.noiseOff + sk.frameCount * 0.004) - 0.5) * Math.PI * noiseStrength;
    const cnx = nx * Math.cos(angle) - ny * Math.sin(angle);
    const cny = nx * Math.sin(angle) + ny * Math.cos(angle);

    const s = speed * (0.8 + this.drift * 0.4);
    this.x += cnx * s;
    this.y += cny * s;
    this.sy = this.y;
    this.phase += 0.18 * speed;
    this.noiseOff += 0.002;
  }

  /* Build the 8-bit figure pixel-by-pixel */
  drawSprite(sk, ps) {
    const x = Math.floor(this.x);
    const y = Math.floor(this.y);
    const leg = Math.sin(this.phase) > 0 ? 1 : -1;

    const p = (col, row, r, g, b, a) => {
      sk.noStroke();
      sk.fill(r, g, b, a || 255);
      sk.rect(x + col * ps - ps * 2, y + row * ps, ps, ps);
    };

    const [cr, cg, cb] = this.coat;
    const [hr, hg, hb] = this.hat;
    const [tr, tg, tb] = this.trouser;
    const [sr, sg, sb] = this.skin;

    // Hat
    p(1, 0, hr, hg, hb);
    p(2, 0, hr, hg, hb);
    p(3, 0, hr, hg, hb);
    p(1, 1, hr + 5, hg + 4, hb + 3);
    p(2, 1, hr + 5, hg + 4, hb + 3);
    p(3, 1, hr + 5, hg + 4, hb + 3);
    p(2, 2, hr + 8, hg + 6, hb + 4);

    // Face & tie
    p(1, 3, sr, sg, sb);
    p(2, 3, sr, sg, sb);
    p(3, 3, sr, sg, sb);
    p(2, 4, 20, 16, 10);

    // Coat shoulders & body
    p(0, 4, cr, cg, cb);
    p(1, 4, cr + 5, cg + 4, cb + 3);
    p(2, 4, cr + 5, cg + 4, cb + 3);
    p(3, 4, cr + 5, cg + 4, cb + 3);
    p(4, 4, cr, cg, cb);
    p(1, 5, cr, cg, cb);
    p(2, 5, cr + 3, cg + 2, cb + 2);
    p(3, 5, cr, cg, cb);
    p(1, 6, cr, cg, cb);
    p(2, 6, cr + 3, cg + 2, cb + 2);
    p(3, 6, cr, cg, cb);

    // Briefcase (optional)
    if (this.brief) {
      const [br, bg2, bb] = this.brief;
      p(4, 5, br, bg2, bb);
      p(4, 6, br - 8, bg2 - 6, bb - 4);
      p(4, 4, 40, 32, 20);
    }

    // Trousers
    p(1, 7, tr, tg, tb);
    p(2, 7, tr, tg, tb);
    p(3, 7, tr, tg, tb);
    p(1, 8, tr - 5, tg - 4, tb - 3);
    p(2, 8, tr - 5, tg - 4, tb - 3);
    p(3, 8, tr - 5, tg - 4, tb - 3);

    // Shoes (alternating leg)
    const lOff = leg > 0 ? 1 : 0;
    p(1 + lOff, 9, 18, 14, 9);
    p(2 + (1 - lOff), 9, 22, 18, 12);

    // Ground shadow
    sk.noStroke();
    sk.fill(20, 16, 10, 60);
    sk.ellipse(x + ps, y + ps * 9.5, ps * 4, ps * 1.5);
  }
}

// ---- Walker factory (random attributes for each spawn) ----

/**
 * Create a new Walker with randomised coat / hat / skin / briefcase.
 * @param {boolean} scatter - true for random placement, false for funnel-top
 * @param {object} params - app.params (needs funnelSpread)
 * @param {object} sk - p5 instance (for random)
 * @param {object} deps - Walker deps { sk, noise, params }
 * @returns {Walker}
 */
export function createWalker(scatter, params, sk, deps) {
  const cx = W / 2;
  const entranceY = H * 0.72;
  const spread = params.funnelSpread;
  let x, y;

  if (scatter) {
    x = sk.random(80, W - 80);
    y = sk.random(60, H * 0.85);
  } else {
    x = cx + sk.random(-W * spread * 0.5, W * spread * 0.5);
    y = sk.random(-20, 60);
  }

  const coatC = COAT_COLORS[Math.floor(sk.random(COAT_COLORS.length))];
  const hatC = HAT_COLORS[Math.floor(sk.random(HAT_COLORS.length))];
  const trouserC = TROUSER_COLORS[Math.floor(sk.random(TROUSER_COLORS.length))];
  const skinC = SKIN_TONES[Math.floor(sk.random(SKIN_TONES.length))];
  const briefC =
    sk.random() < 0.7 ? BRIEFCASE_COLORS[Math.floor(sk.random(BRIEFCASE_COLORS.length))] : null;
  const phase = sk.random(0, Math.PI * 2);

  return new Walker(x, y, cx, entranceY, coatC, hatC, trouserC, skinC, briefC, phase, deps);
}
