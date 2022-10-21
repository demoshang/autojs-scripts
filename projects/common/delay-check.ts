const buildTimerLogger = (timeout: number, log: boolean | number = false) => {
  const when = Date.now();
  let lastLogTime = when;

  return () => {
    const now = Date.now();
    const passTime = now - when;
    const restTime = timeout - passTime;

    let isLog = false;

    if (log === true) {
      isLog = true;
    } else if (typeof log === 'number' && now - lastLogTime > log) {
      isLog = true;
      lastLogTime = now;
    }

    if (isLog) {
      if (passTime >= 500) {
        console.log(
          `pass ${(passTime / 1000).toFixed(1)}s, rest ${(
            restTime / 1000
          ).toFixed(1)}s, total ${(timeout / 1000).toFixed(1)}s`,
        );
      } else {
        console.log(`total ${(timeout / 1000).toFixed(1)}s`);
      }
    }

    return { passTime, restTime };
  };
};

function delayCheck<T>({
  timeout = 15000,
  delay = 800,
  checkFn,
  runFn,
  runFirst = true,
  log = false,
}: {
  timeout?: number;
  delay?: number;
  checkFn: (restTime?: number) => T;
  runFn?: (restTime?: number) => void;
  runFirst?: boolean;
  log?: boolean | number;
}): false | T {
  if (runFirst && runFn) {
    runFn();
  }

  const getTime = buildTimerLogger(timeout, log);

  while (true) {
    const { restTime } = getTime();

    if (restTime < 0) {
      break;
    }

    const result = checkFn(restTime);
    if (result) {
      return result;
    }

    if (runFn) {
      runFn(restTime);
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
