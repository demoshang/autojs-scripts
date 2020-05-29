import { isUiObject, isRect } from './type-check';
import { statusBarHeight } from './floaty-debug';

interface Position {
  x: number;
  y: number;
}

function checkInScreen(item?: UiObject | Rect | Position | null) {
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

  return y < device.height - statusBarHeight && x < device.width;
}

export { checkInScreen };
