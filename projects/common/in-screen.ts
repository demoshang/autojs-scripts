import { isUiObject } from './type-check';

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

  return rect.centerY() < device.height && rect.centerX() < device.width;
}

export { checkInScreen };
