function delayCheck<T>(
  timeout: number,
  delay: number,
  checkFn: () => T,
  runFn?: () => void,
  runFirst = true,
): false | T {
  if (runFirst && runFn) {
    runFn();
  }

  while (timeout > 0) {
    // eslint-disable-next-line no-param-reassign
    timeout -= delay;

    const result = checkFn();
    if (result) {
      return result;
    }

    if (runFn) {
      runFn();
    }

    sleep(delay);
  }

  return false;
}

function delayRun(
  delay: number,
  runFn: () => void,
  checkFn: () => boolean,
  retries = 3,
): void {
  let left = retries;
  while (left > 0) {
    if (!checkFn()) {
      left -= 1;
      sleep(delay);
    } else {
      left = retries;
      runFn();
    }
  }
}

export { delayCheck, delayRun };
