import { statusBarHeight } from './floaty-debug';
import { isRect, isUiObject } from './type-check';

interface Position {
  x: number;
  y: number;
}

function checkInScreen(item?: UiObject | Rect | Position | null): boolean {
  if (!item) {
    return false;
  }

  let rect;
  let x = 0;
  let y = 0;

  if (isUiObject(item)) {
    rect = item.bounds();
    x = rect.centerX();
    y = rect.centerY();
  } else if (isRect(item)) {
    x = item.centerX();
    y = item.centerY();
  } else {
    x = item.x;
    y = item.y;
  }

  console.info({
    centerY: x,
    centerX: y,
    height: device.height,
    width: device.width,
  });

  return (
    y + statusBarHeight < device.height &&
    y - statusBarHeight > 0 &&
    x > 0 &&
    x < device.width
  );
}

export { checkInScreen };
