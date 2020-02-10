import xml from './floaty-debug.xml';
import { Bounds, DebugPosition, Radius, RectWithWH } from './interface';
import { toInt } from './to-int';
import { isBounds, isRadius, isRect, isRectWithWH, isUiObject } from './type-check';

const { density } = context.getResources().getDisplayMetrics();
const statusBarHeight = (() => {
  const id = context.getResources().getIdentifier('status_bar_height', 'dimen', 'android');
  if (id > 0) {
    return context.getResources().getDimensionPixelSize(id);
  }

  return 0;
})();

let floatyWindow: any;

function resolveHidden() {
  return {
    x: -100,
    y: -100,

    width: 0,
    height: 0,

    radius: 0,

    alpha: 0.3,
    radiusAlpha: 0,
    color: '#FF0000',
  };
}

function resolveBounds(item: Bounds) {
  return {
    x: item.bounds.left,
    y: item.bounds.top,
    width: toInt(item.bounds.width() / density),
    height: toInt(item.bounds.height() / density),

    color: item.color,
    alpha: item.alpha,
  };
}

function resolveRect(item: Rect) {
  return {
    x: item.left,
    y: item.top,
    width: toInt(item.width() / density),
    height: toInt(item.height() / density),
  };
}

function resolveRectWithWH(item: RectWithWH) {
  return {
    x: item.x || 0,
    y: item.y || 0,
    width: toInt(item.w / density),
    height: toInt(item.h / density),

    alpha: item.alpha,
    color: item.color,
  };
}

function resolveRadius(item: Radius) {
  const radius = typeof item.r === 'number' ? item.r : 10;

  return {
    x: item.x - radius,
    y: item.y - radius,
    width: radius * 2,
    height: radius * 2,
    radius,

    alpha: 0,
    radiusAlpha: item.alpha || 0.3,
    color: item.color,
  };
}

function floatyDebug(timeoutOrPosition?: number | DebugPosition, ...args: DebugPosition[]): void {
  let timeout = 3000;

  if (typeof timeoutOrPosition === 'undefined') {
    return;
  }
  if (typeof timeoutOrPosition === 'number') {
    timeout = timeoutOrPosition;
  } else {
    args.unshift(timeoutOrPosition);
  }

  console.info(
    'positons: ',
    args.map((item) => {
      if (isUiObject(item)) {
        return resolveRect(item.bounds());
      }
      if (isRect(item)) {
        return resolveRect(item);
      }
      if (isBounds(item)) {
        return resolveBounds(item);
      }
      return item;
    })
  );

  if (floatyWindow) {
    floatyWindow.close();
    floatyWindow = null;
  }

  setTimeout(() => {
    if (floatyWindow) {
      floatyWindow.close();
    }
  }, timeout);

  const hidden = resolveHidden();

  // 强制设置长度为 10
  if (args.length > 10) {
    console.warn('too many pints, only show 10 point');
    // eslint-disable-next-line no-param-reassign
    args.length = 10;
  } else {
    while (args.length < 10) {
      args.push(hidden);
    }
  }

  const xmlParams = args
    .map((item) => {
      if (!item) {
        return hidden;
      }

      if (isUiObject(item)) {
        return resolveRect(item.bounds());
      }

      if (isBounds(item)) {
        return resolveBounds(item);
      }

      if (isRect(item)) {
        return resolveRect(item);
      }

      if (isRectWithWH(item)) {
        return resolveRectWithWH(item);
      }

      if (isRadius(item)) {
        return resolveRadius(item);
      }

      return hidden;
    })
    .map((item) => {
      return {
        ...hidden,
        ...item,
      };
    });

  floatyWindow = xml(...xmlParams);

  floatyWindow.setSize(-1, -1);
  floatyWindow.setTouchable(false);

  ui.run(() => {
    xmlParams.forEach(({ x, y }, i) => {
      const ele = floatyWindow[`frame${i}`];
      ele.x = x;
      // 悬浮窗和顶部的距离(状态栏)
      ele.y = y - statusBarHeight;
    });
  });
}

export { floatyDebug };
