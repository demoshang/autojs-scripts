import { checkInScreen } from './in-screen';
import { isUiObject } from './type-check';

interface ScrollInOptions {
  sleepMs?: number;
  swipeDuration?: number;
  step?: number;
  max?: number;
}

type GetUiObject = () => UiObject | null | undefined;
type ScrollResult = { x: number; y: number } | undefined | null;

function scroll(ele?: UiObject | null, sleepMs = 0): void {
  if (!ele) {
    return;
  }

  const bounds = ele.bounds();
  const x = bounds.left + bounds.width() / 2;
  swipe(x, bounds.top + bounds.height(), x, bounds.top, 200);

  sleep(sleepMs);
}

function scrollOut(
  ele?: UiObject | null,
  { sleepMs = 0, swipeDuration = 1000, offset = 10 } = {}
): void {
  if (!ele) {
    return;
  }

  const bounds = ele.bounds();
  const x = bounds.left + bounds.width() / 2;
  swipe(x, bounds.top + bounds.height() + offset, x, 0, swipeDuration);

  sleep(sleepMs);
}

function scrollInWithStaticUiObject(
  ele?: UiObject | null,
  { sleepMs = 0, swipeDuration = 1000, step = device.height / 4, max = 5 } = {}
) {
  if (!ele) {
    return undefined;
  }

  const bounds = ele.bounds();
  const x = bounds.centerX();
  let y = bounds.bottom;
  if (y >= 0) {
    // eslint-disable-next-line no-param-reassign
    step *= -1;
  }

  for (let i = 0; i < max; i += 1) {
    console.log(
      'scrollInWithStaticUiObject',
      i,
      'is in screen: ',
      checkInScreen({ x, y }),
      x,
      y
    );
    if (checkInScreen({ x, y })) {
      break;
    }

    swipe(x, device.height / 2, x, device.height / 2 + step, swipeDuration);
    y += step;
  }

  sleep(sleepMs);

  return { x, y };
}

function scrollInWithDynamicUiObject(
  fn: GetUiObject,
  options?: ScrollInOptions
) {
  const max = (options && options.max) || 5;

  // 最终结果
  let data;

  for (let i = 0; i < max; i += 1) {
    const ele = fn();

    // 在屏幕内了
    if (checkInScreen(ele)) {
      break;
    }

    data = scrollInWithStaticUiObject(ele, { ...options, max: 1 });

    // 滚动失败
    if (!data) {
      break;
    }
  }

  const ele = fn();
  return checkInScreen(ele) ? ele : undefined;
}

function scrollIn(
  fn: GetUiObject,
  options?: ScrollInOptions
): UiObject | undefined;
function scrollIn(
  ele?: UiObject | null,
  options?: ScrollInOptions
): ScrollResult;
function scrollIn(
  ele?: any,
  options?: ScrollInOptions
): ScrollResult | UiObject {
  let data;
  if (typeof ele === 'function') {
    data = scrollInWithDynamicUiObject(ele, options);
  } else {
    data = scrollInWithStaticUiObject(ele, options);
  }

  if (isUiObject(data)) {
    return data;
  }
  if (checkInScreen(data)) {
    return data;
  }
  return undefined;
}

function scrollPage(swipeDuration = 1000): void {
  const x = device.width / 2;
  swipe(x, device.height / 2, x, device.height / 4, swipeDuration);
}

export { scroll as myScroll, scrollOut, scrollIn, scrollPage };
