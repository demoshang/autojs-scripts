import { isUiObject } from './type-check';
import { statusBarHeight } from './floaty-debug';

function checkInScreen(item?: UiObject | Rect | null) {
  if (!item) {
    return false;
  }

  let rect;

  if (isUiObject(item)) {
    rect = item.bounds();
  } else {
    rect = item;
  }

  console.info({
    centerY: rect.centerY(),
    centerX: rect.centerX(),
    height: device.height,
    width: device.width,
  });

  return rect.centerY() < device.height - statusBarHeight && rect.centerX() < device.width;
}

export { checkInScreen };
