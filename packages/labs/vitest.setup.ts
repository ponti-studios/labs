import "@testing-library/jest-dom";

if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

if (!HTMLElement.prototype.animate) {
  HTMLElement.prototype.animate = function animate(): Animation {
    return { cancel: () => {} } as Animation;
  };
}
