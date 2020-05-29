import { floatyDebug } from './floaty-debug';
import { isRect, isRegExp } from './type-check';

type Position = (bounds: Rect) => { x: number; y: number };

function boundsClick(rect?: Rect, delay?: number, position?: Position): boolean;
function boundsClick(ele?: UiObject | null, delay?: number, position?: Position): boolean;
function boundsClick(str?: string, delay?: number, position?: Position): boolean;
function boundsClick(reg?: RegExp, delay?: number, position?: Position): boolean;
function boundsClick(
  param?: Rect | UiObject | string | RegExp | null,
  delay = 2000,
  position = (bounds: Rect) => {
    return { x: bounds.centerX(), y: bounds.centerY() };
  }
): boolean {
  let bounds: Rect | undefined;

  if (typeof param === 'undefined' || param === null) {
    return false;
  }

  if (typeof param === 'string') {
    bounds = textContains(param)
      .findOnce()
      ?.bounds();
  } else if (isRegExp(param)) {
    bounds = textMatches(param)
      .findOnce()
      ?.bounds();
  } else if (isRect(param)) {
    bounds = param;
  } else {
    bounds = param?.bounds();
  }

  if (!bounds) {
    return false;
  }

  floatyDebug(bounds);

  const { x, y } = position(bounds);

  click(x, y);
  sleep(delay);
  return true;
}

export { boundsClick };
