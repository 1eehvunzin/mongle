// App Store screenshot size for the 12.9"/13" iPad slot (Apple-supported):
// 2048x2732 portrait — same 4:3-ish ratio as the newer 2064x2752 size, close
// enough that this one canvas covers both without a second design pass.
// The canvas is these placed side by side, one per marketing beat, mirroring
// layout.ts's iPhone canvas but at the iPad's own (much wider) proportions.
export const PANEL_W = 2048;
export const PANEL_H = 2732;
export const PANEL_COUNT = 6;
export const CANVAS_W = PANEL_W * PANEL_COUNT;
export const CANVAS_H = PANEL_H;
