import { shadows, type ShadowToken } from "../tokens";

/**
 * One layer of a shadow in the shape React Native's `boxShadow` expects.
 *
 * The shared shadow tokens are authored for CSS, where each dimension carries
 * its own unit. React Native takes bare numbers (density-independent pixels),
 * so the unit is dropped here rather than at every call site.
 */
export interface NativeShadowLayer {
  color: string;
  offsetX: number;
  offsetY: number;
  blurRadius: number;
  spreadDistance: number;
  inset: boolean;
}

/**
 * The shared shadow scale translated to React Native's `boxShadow` shape.
 *
 * Every token maps to an array of layers, including `none`, which is a single
 * fully transparent layer rather than an empty array — that keeps the value
 * assignable wherever a real shadow is expected.
 */
export const nativeShadows = Object.fromEntries(
  Object.entries(shadows).map(([name, layers]) => [
    name,
    layers.map((layer) => ({
      color: layer.color,
      offsetX: layer.offsetX.value,
      offsetY: layer.offsetY.value,
      blurRadius: layer.blur.value,
      spreadDistance: layer.spread.value,
      inset: false,
    })),
  ]),
) as Record<ShadowToken, NativeShadowLayer[]>;
