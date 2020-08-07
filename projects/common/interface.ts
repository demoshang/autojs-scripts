export interface BasePosition {
  color?: number | string;
  alpha?: number;
}

export interface Bounds extends BasePosition {
  // 长方体
  bounds: Rect;
}

export interface Radius extends BasePosition {
  // 圆半径
  r?: number;
  // 圆中心
  x: number;
  y: number;
}

export interface RectWithWH extends BasePosition {
  // 长方形
  // 左上角
  x?: number;
  y?: number;
  // 宽和高
  w: number;
  h: number;
}

export type DebugPosition =
  | Bounds
  | Radius
  | RectWithWH
  | Rect
  | UiObject
  | null
  | undefined;
