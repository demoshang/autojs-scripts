import xml from './floaty-debug.xml';

interface DebugPosition {
  radius?: number;
  color?: string;
  x?: number;
  y?: number;
}

let floatyWindow: any;

function floatyDebug(timeoutOrPosition?: number | DebugPosition, ...args: DebugPosition[]): void {
  let timeout = 5000;

  if (typeof timeoutOrPosition === 'undefined') {
    return;
  }
  if (typeof timeoutOrPosition === 'number') {
    timeout = timeoutOrPosition;
  } else {
    args.unshift(timeoutOrPosition);
  }

  console.info('positons: ', args);

  if (floatyWindow) {
    floatyWindow.close();
    floatyWindow = null;
  }

  setTimeout(() => {
    if (floatyWindow) {
      floatyWindow.close();
    }
  }, timeout);

  const xmlParams = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    .map(() => {
      return {
        radius: 10,
        color: 'red',
        x: -100,
        y: -100,
      };
    })
    .map((item, index) => {
      return {
        ...item,
        ...args[index],
      };
    })
    .map((item) => {
      return {
        ...item,
        width: item.radius * 2,
        height: item.radius * 2,
        x: item.x - item.radius,
        y: item.y - item.radius - 100,
      };
    });

  floatyWindow = xml(...xmlParams);

  floatyWindow.setSize(-1, -1);
  floatyWindow.setTouchable(false);

  ui.run(() => {
    xmlParams.forEach(({ x, y }, i) => {
      floatyWindow[`img${i}`].x = x;
      floatyWindow[`img${i}`].y = y;
    });
  });
}

export { floatyDebug };
