# The Physics of Glass

How SVG filters recreate the refraction, dispersion, and light behavior of real glass.

Glass is not a solid in the classical sense—it's a supercooled liquid in a solid state. When
light passes through it, the atoms bend and refract the light rays, creating the effects we
see: distortion, color separation, and the illusion of depth. This doc explains how the
[`/experiments/glass`](https://ponti.studio/experiments/glass) demo simulates those phenomena
using SVG filters, a Canvas-generated displacement map, and a little mathematics — see
[`LiquidGlass.tsx`](../../app/components/LiquidGlass.tsx) for the implementation.

## Part 1: Refraction & Snell's Law

When light travels from one medium to another (air to glass, or glass to air), it bends
according to **Snell's Law**:

```
n₁ × sin(θ₁) = n₂ × sin(θ₂)
```

where *n* is the refractive index and *θ* is the angle from the normal.

The **refractive index** of common glass is about 1.5, while air is 1.0. This difference causes
light to bend when crossing the boundary. The greater the angle of incidence, the more dramatic
the bending.

In the SVG implementation, we use `feDisplacementMap` to simulate this bending. Instead of
calculating actual rays, we shift pixel coordinates based on a displacement map—effectively
creating the illusion of refraction.

## Part 2: Chromatic Aberration

Real glass doesn't refract all colors equally. Shorter wavelengths (blue light) refract more
than longer wavelengths (red light). This phenomenon is called **dispersion**, and it's why
prisms split white light into rainbows.

To simulate this in SVG, we apply **three displacement passes**—one for each RGB channel—using
slightly different scale values. The displacement map stays the same, but we extract and
manipulate each color channel independently:

```
red_scale   = refraction - aberration
green_scale = refraction
blue_scale  = refraction + aberration
```

Each channel gets shifted by its own scale value, then they're recombined using screen
blending. This creates the characteristic color fringing you see at the edges of the glass
effect.

## Part 3: How `feDisplacementMap` Works

SVG's `feDisplacementMap` is the core primitive that makes the glass effect possible. It works
by looking up displacement values from a secondary image (the displacement map) and shifting
source pixels based on those values:

```
x' = x + scale × (displacement_value / 255 − 0.5)
```

For each output pixel at (x, y), look up the displacement map at that same location. The pixel
brightness (0–255) is normalized to a −0.5–0.5 range, then multiplied by the scale factor.

| Displacement map value | Shift                                    |
| ----------------------- | ----------------------------------------- |
| Dark pixel (0)           | `scale × (0 − 0.5) = −scale / 2` (leftward/upward)  |
| Gray pixel (127)         | `scale × (0.5 − 0.5) = 0` (no displacement)         |
| Light pixel (255)        | `scale × (1 − 0.5) = scale / 2` (rightward/downward) |

The displacement map is a rounded rectangle: dark/gradient edges and a blurred, near-neutral
interior. This creates smooth, natural-looking refraction at the edges while leaving the center
relatively undistorted.

## Part 4: Building the Glass Effect

The effect is built in stages, each adding a layer of visual complexity:

1. **Generate the displacement map.** A Canvas 2D pass draws a black rounded-rect base with a
   red left-to-right gradient (X-axis displacement) and a blue top-to-bottom gradient blended
   with `difference` (Y-axis displacement), topped by a blurred, near-opaque center so the
   middle of the glass stays calm while refraction concentrates at the edges. The canvas is
   padded with neutral gray on every side so the filter has room to sample displaced pixels
   without hard-clipping at its own boundary.
2. **Chromatic aberration.** Apply `feDisplacementMap` three times with different scales,
   extracting one RGB channel per pass via `feColorMatrix`.
3. **Recombine.** Screen-blend the three displaced channels back together to reconstruct a
   full-color image with per-channel offsets.
4. **Apply as `backdrop-filter`.** Rather than filtering the glass shape's own fill, the filter
   is applied via `backdrop-filter: url(#filterId)` directly on the element — so it refracts
   whatever is actually behind it on the page, not a fake copy of it.

### The math

```js
// Convert desired pixel refraction to scale values.
// The displacement map's neutral gray (127, 127, 127), when shifted,
// gives a maximum deviation of ±0.5.
const toScale = (px) => px / 0.5;

const scale_red = toScale(refraction - aberration);
const scale_green = toScale(refraction);
const scale_blue = toScale(refraction + aberration);
```

### Filter-region padding

SVG filters hard-clip their output at the filter element's own region — by default, exactly the
filtered element's bounding box, with zero margin. `feDisplacementMap` can shift a pixel by up
to `scale / 2` units in any direction, so without extra room those shifted pixels — and the
rounded corners of the glass shape itself — get clipped unevenly wherever the shift pushes past
that boundary. The fix: size the filter's region, and the displacement map's own canvas, to the
actual maximum displacement in play:

```js
const maxDisplace = Math.max(maxScale * 0.5, 20);
const pad = Math.ceil(maxDisplace);
const regionPercent = Math.ceil((pad / elementWidth) * 100);
// filter x/y = -regionPercent%, width/height = 100% + 2 × regionPercent%
```

This is a well-known gotcha for SVG-based glass/refraction effects — see
[rizroze/liquid-glass](https://github.com/rizroze/liquid-glass), which this implementation is
based on.

## Part 5: Why This Technique Matters

This approach demonstrates how fundamental physics can be baked into visual design. It's not a
canvas blur or a plain CSS filter — it's a physically plausible light simulation built from SVG
filter primitives and a real backdrop sample.

- **No JavaScript rendering** — the GPU handles the math via SVG filters.
- **Draggable in real time** — updating scale values doesn't require recalculating the whole
  effect.
- **Reusable & composable** — the same filter chain can be applied to any element via
  `backdrop-filter`.
- **Hardware accelerated** — modern browsers render SVG filters on the GPU.

**The takeaway:** great visual effects aren't magic—they're applied physics. By understanding
the underlying principles (Snell's Law, dispersion, light blending), it's possible to build
effects that feel real because they *are* real (simulated).

### Try it yourself

Open [`/experiments/glass`](https://ponti.studio/experiments/glass) and adjust the RGB
displacement sliders. Each channel shift simulates a different wavelength of light bending
through the glass. Lower values mean subtle refraction; higher values mean dramatic chromatic
aberration.

Challenge: recreate the color fringing of a real prism by setting red to `-40`, green to `0`,
and blue to `+40`.
