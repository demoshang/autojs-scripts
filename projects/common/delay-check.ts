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

export { delayCheck };
