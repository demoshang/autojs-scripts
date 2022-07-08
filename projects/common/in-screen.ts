import { floatyDebug, statusBarHeight } from './floaty-debug';
import { isRect, isUiObject } from './type-check';

interface Position {
  x: number;
  y: number;
}

type GetUiObject = () => UiObject | null | undefined;
interface ScrollInOptions {
  sleepMs?: number;
  swipeDuration?: number;
  max?: number;
}

function getPos(item?: UiObject | Rect | Position | null): Position {
  if (!item) {
    return {
      x: -Number.MAX_VALUE,
      y: -Number.MAX_VALUE,
    };
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

  return {
    x,
    y,
  };
}

function checkIsInReact(
  { x, y }: Position,
  topLeft: Position = { x: 0, y: statusBarHeight },
  bottomRight: Position = {
    x: device.width,
    y: device.height - statusBarHeight,
  },
) {
  return (
    y < bottomRight.y && y > topLeft.y && x > topLeft.x && x < bottomRight.x
  );
}

function keepEleInReact(
  item?: UiObject | Rect | Position | null,
  topLeft: Position = { x: 0, y: statusBarHeight },
  bottomRight: Position = {
    x: device.width,
    y: device.height - statusBarHeight,
  },
  { max = 10, swipeDuration = 300, sleepMs = 0 }: ScrollInOptions = {},
) {
  const pos = getPos(item);
  if (checkIsInReact(pos, topLeft, bottomRight)) {
    return true;
  }

  let { x, y } = pos;

  const fingerPos = { x, y: bottomRight.y - topLeft.y };
  let step = fingerPos.y / 4;

  if (y > bottomRight.y) {
    step *= -1;
  }

  floatyDebug(fingerPos, {
    x,
    y: fingerPos.y + step,
  });

  for (let i = 0; i < max; i += 1) {
    if (checkIsInReact({ x, y }, topLeft, bottomRight)) {
      break;
    }

    swipe(x, fingerPos.y, x, fingerPos.y + step, swipeDuration);
    sleep(swipeDuration);
    y += step;
  }

  sleep(sleepMs);

  return false;
}

function checkInScreen(
  item?: UiObject | Rect | Position | null,
  topLeft?: Position,
  bottomRight?: Position,
): boolean {
  if (!item) {
    return false;
  }

  return checkIsInReact(getPos(item), topLeft, bottomRight);
}

function keepInDynamic(
  fn: GetUiObject,
  topLeft?: Position,
  bottomRight?: Position,
  options?: ScrollInOptions,
) {
  const max = options?.max || 5;

  let isAlreadyIn = false;

  for (let i = 0; i < max; i += 1) {
    const ele = fn();

    if (keepEleInReact(ele, topLeft, bottomRight)) {
      if (i === 0) {
        isAlreadyIn = true;
      }

      break;
    }
  }

  return isAlreadyIn;
}

export { checkInScreen, keepEleInReact, keepInDynamic };
