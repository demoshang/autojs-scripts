import xml from './floaty-debug.xml';
import { Bounds, DebugPosition, Radius, RectWithWH } from './interface';
import { toInt } from './to-int';
import {
  isBounds,
  isRadius,
  isRect,
  isRectWithWH,
  isUiObject,
} from './type-check';

importClass(android.view.View);

const { density } = context.getResources().getDisplayMetrics();
const statusBarHeight = (() => {
  const id = context
    .getResources()
    .getIdentifier('status_bar_height', 'dimen', 'android');
  if (id > 0) {
    return context.getResources().getDimensionPixelSize(id);
  }

  return 0;
})();

let floatyWindow: any = null;
let thread: threads.Thread | null = null;

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

type ClickCallback<T> = (debugPosition: T, index: number) => void;

function floatyDebug<T>(clickCallback: ClickCallback<T>, ...args: T[]): void;
function floatyDebug<T>(
  clickCallback: (debugPosition: T, index: number) => void,
  timeout: number,
  ...args: T[]
): void;
function floatyDebug(timeout: number, ...args: DebugPosition[]): void;
function floatyDebug(...args: DebugPosition[]): void;
function floatyDebug(
  arg1?: ClickCallback<any> | number | DebugPosition,
  arg2?: number | DebugPosition,
  ...args: DebugPosition[]
): void {
  let timeout = 3000;

  let clickCallback: ClickCallback<any> | undefined;

  if (typeof arg1 === 'undefined') {
    return;
  }

  if (typeof arg2 === 'undefined') {
    // do nothing
  } else if (typeof arg2 === 'number') {
    timeout = arg2;
  } else {
    args.unshift(arg2);
  }

  if (typeof arg1 === 'number') {
    timeout = arg1;
  } else if (typeof arg1 === 'function') {
    clickCallback = arg1;
  } else {
    args.unshift(arg1);
  }

  if (!args.length) {
    return;
  }

  console.log(
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

  const hidden = resolveHidden();

  // 强制设置长度为 30
  if (args.length > 30) {
    console.warn('too many pints, only show 30 point');
    // eslint-disable-next-line no-param-reassign
    args.length = 30;
  } else {
    while (args.length < 30) {
      args.push(hidden);
    }
  }

  const xmlParams = args
    .map((item) => {
      if (!item) {
        return { ...hidden, visibility: View.GONE };
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

      return { ...hidden, visibility: View.GONE };
    })
    .map((item, index) => {
      return {
        visibility: View.VISIBLE,
        ...hidden,
        ...item,
        index,
      };
    });

  if (floatyWindow) {
    floatyWindow.close();
    floatyWindow = null;
  }

  if (thread) {
    thread.interrupt();
    thread = null;
  }

  floatyWindow = xml(...xmlParams);
  floatyWindow.setSize(-1, -1);

  if (!clickCallback) {
    floatyWindow.setTouchable(false);
  }

  ui.run(() => {
    xmlParams.forEach(({ x, y, width, height, index, visibility }) => {
      const window = floatyWindow[`frame${index}`];

      window.setVisibility(visibility);
      window.x = x;
      // 悬浮窗和顶部的距离(状态栏)
      window.y = y - statusBarHeight;

      window.click(() => {
        if (clickCallback) {
          clickCallback(args[index], index);
        }
      });

      const text = floatyWindow[`text${index}`];
      if (text) {
        text.setText(`${index}`);
        text.x = width;
        text.y = height / 2;
      }
    });
  });

  thread = threads.start(() => {
    setTimeout(() => {
      if (floatyWindow) {
        floatyWindow.close();
        floatyWindow = null;
      }
    }, timeout);
  });
}

export { floatyDebug, statusBarHeight };
