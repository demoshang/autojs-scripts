import { checkInScreen } from './in-screen';

function scroll(ele?: UiObject | null, sleepMs = 0) {
  if (!ele) {
    return;
  }

  const bounds = ele.bounds();
  const x = bounds.left + bounds.width() / 2;
  swipe(x, bounds.top + bounds.height(), x, bounds.top, 200);

  sleep(sleepMs);
}

function scrollOut(ele?: UiObject | null, { sleepMs = 0, swipeDuration = 1000, offset = 10 } = {}) {
  if (!ele) {
    return;
  }

  const bounds = ele.bounds();
  const x = bounds.left + bounds.width() / 2;
  swipe(x, bounds.top + bounds.height() + offset, x, 0, swipeDuration);

  sleep(sleepMs);
}

function scrollIn(
  ele?: UiObject | null,
  { sleepMs = 0, swipeDuration = 1000, step = device.height / 4, max = 5 } = {}
) {
  if (!ele) {
    return;
  }

  const bounds = ele.bounds();
  const x = bounds.left + bounds.width() / 2;
  let y = bounds.centerY();
  if (y >= 0) {
    // eslint-disable-next-line no-param-reassign
    step *= -1;
  }

  for (let i = 0; i < max; i += 1) {
    console.log(i, 'is in screen: ', checkInScreen({ x, y }), x, y);
    if (checkInScreen({ x, y })) {
      break;
    }

    swipe(x, device.height / 2, x, device.height / 2 + step, swipeDuration);
    y += step;
  }

  sleep(sleepMs);
}

function scrollPage(swipeDuration = 1000) {
  const x = device.width / 2;
  swipe(x, device.height / 2, x, device.height / 4, swipeDuration);
}

export { scroll as myScroll, scrollOut, scrollIn, scrollPage };
