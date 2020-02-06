import xml from './floaty-debug.xml';

function floatyDebug(
  timeout = 3000,
  ...args: { radius?: number; color?: string; x?: number; y?: number }[]
) {
  const xmlParams = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    .map(() => {
      return {
        radius: 0,
        color: 'red',
        x: 0,
        y: 100,
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

  const w = xml(...xmlParams);
  w.setSize(-1, -1);
  w.setTouchable(false);

  ui.run(() => {
    xmlParams.forEach(({ x, y }, i) => {
      w[`img${i}`].x = x;
      w[`img${i}`].y = y;
    });
  });

  setTimeout(() => {
    w.close();
  }, timeout);
}

export { floatyDebug };
