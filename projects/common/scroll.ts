function scroll(ele?: UiObject | null, sleepMs = 0) {
  if (!ele) {
    return;
  }

  const bounds = ele.bounds();
  const x = bounds.left + bounds.width() / 2;
  swipe(x, bounds.top + bounds.height(), x, bounds.top, 200);

  sleep(sleepMs);
}

export { scroll as myScroll };
