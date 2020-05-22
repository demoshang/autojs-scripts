function delayCheck<T>(timeout: number, delay: number, checkFn: () => T, runFn?: Function) {
  while (timeout > 0) {
    // eslint-disable-next-line no-param-reassign
    timeout -= delay;

    if (runFn) {
      runFn();
    }

    const result = checkFn();
    if (result) {
      return result;
    }

    sleep(delay);
  }

  return false;
}

function delayRun(delay: number, runFn: Function, checkFn: () => boolean, retries = 3) {
  let left = retries;
  while (left > 0) {
    if (!checkFn()) {
      left -= 1;
      sleep(delay);
    } else {
      left = 0;
      runFn();
    }
  }
}

export { delayCheck, delayRun };
