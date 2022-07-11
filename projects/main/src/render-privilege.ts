import { checkFloaty, openFloatySetting } from '@/common/floaty-permission';
import { tl } from '@/common/toast';
import accessFailedWidget from './privilege/access-failed.xml';
import accessSuccessWidget from './privilege/access-success.xml';

import floatyFailedWidget from './privilege/floaty-failed.xml';
import floatySuccessWidget from './privilege/floaty-success.xml';

const cache: Record<string, any> = {};

function checkAccess() {
  return !!auto.service;
}

function renderAccess() {
  const isAccess = checkAccess();

  // 先移除
  if (cache.access) {
    console.log('==========removeView========', cache.access);
    ui.container.removeView(cache.access);
    cache.access = null;
  }

  const widget = isAccess ? accessSuccessWidget() : accessFailedWidget();
  ui.container.addView(widget);

  // 缓存, 以备下次移除
  cache.access = widget;

  if (!isAccess) {
    const openEle = widget.getChildAt(2);

    openEle.click(() => {
      app.startActivity({
        action: 'android.settings.ACCESSIBILITY_SETTINGS',
      });
    });
  }
}

function renderFloaty() {
  const isFloaty = checkFloaty();

  // 先移除
  if (cache.floaty) {
    ui.container.removeView(cache.floaty);
    cache.floaty = null;
  }

  const widget = isFloaty ? floatySuccessWidget() : floatyFailedWidget();
  ui.container.addView(widget);

  // 缓存, 以备下次移除
  cache.floaty = widget;

  if (!isFloaty) {
    const openEle = widget.getChildAt(1);

    openEle.click(() => {
      openFloatySetting();
    });
  }
}

function render() {
  const isAccess = checkAccess();
  const isFloaty = checkFloaty();

  tl({ isAccess, isFloaty });

  renderAccess();
  renderFloaty();

  // 权限正常, 无需显示
  if (isAccess && isFloaty) {
    Object.keys(cache).forEach((key) => {
      ui.container.removeView(cache[key]);
      delete cache[key];
    });

    return false;
  }

  return true;
}

export { render };
