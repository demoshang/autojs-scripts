import { isRect, isRegExp } from '../../../common/type-check';

function boundsClick(rect?: Rect, delay?: number): boolean;
function boundsClick(ele?: UiObject | null, delay?: number): boolean;
function boundsClick(str?: string, delay?: number): boolean;
function boundsClick(reg?: RegExp, delay?: number): boolean;
function boundsClick(param?: Rect | UiObject | string | RegExp | null, delay = 2000): boolean {
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

  click(bounds.centerX(), bounds.centerY());
  sleep(delay);
  return true;
}

export { boundsClick };
