declare module "gifenc" {
  export function GIFEncoder(opts?: { initialCapacity?: number; auto?: boolean }): {
    writeFrame(index: Uint8Array, width: number, height: number, opts?: { palette?: Uint32Array; delay?: number; first?: boolean }): void;
    finish(): void;
    bytes(): Uint8Array;
    reset(): void;
  };
  export function quantize(rgba: Uint8Array | Uint8ClampedArray, maxColors: number, options?: object): Uint32Array;
  export function applyPalette(rgba: Uint8Array | Uint8ClampedArray, palette: Uint32Array): Uint8Array;
}
