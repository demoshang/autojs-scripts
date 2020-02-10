function scroll(ele?: UiObject | null) {
  if (!ele) {
    return;
  }

  const bounds = ele.bounds();
  const x = bounds.left + bounds.width() / 2;
  swipe(x, bounds.top + bounds.height(), x, bounds.top, 200);
}

export { scroll as myScroll };
