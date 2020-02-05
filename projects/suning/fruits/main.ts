'ui';

import layout from './layout.xml';

import { checkFloaty } from '../../common/check-floaty';
import { runWithRetry } from './task';

layout();

async function checkFloatyStatus() {
  const isOpened = await checkFloaty();

  toastLog(`悬浮窗服务状态: ${isOpened}`);

  ui.floatyBtn.visibility = 0;

  if (!isOpened) {
    ui.floatyStatusCheck.visibility = 0;
    ui.floatyStatusSuccess.visibility = 8;

    ui.floatyBtn.visibility = 0;
    return false;
  }

  ui.floatyStatusCheck.visibility = 8;
  ui.floatyStatusSuccess.visibility = 0;

  return true;
}

function checkAccessibilityStatus() {
  toastLog(`无障碍服务状态: ${!!auto.service}`);

  if (auto.service === null) {
    ui.accessibilityStatusCheck.visibility = 0;
    ui.accessibilityStatusSuccess.visibility = 8;

    ui.accessibilityBtn.visibility = 0;
    ui.runBtn.visibility = 8;

    return false;
  }

  ui.accessibilityStatusCheck.visibility = 8;
  ui.accessibilityStatusSuccess.visibility = 0;
  ui.waring.visibility = 8;
  ui.runBtn.visibility = 0;

  checkFloatyStatus();

  return true;
}

let threadCache: threads.Thread | null = null;

function run() {
  // 停止上次可能在运行的脚本
  if (threadCache) {
    toastLog('停止上次残留中....');
    threadCache.interrupt();
    threadCache = null;
  }

  try {
    threadCache = threads.start(() => {
      runWithRetry();
    });
  } catch (e) {
    toastLog(e);
  }
}

events.on('exit', () => {
  toastLog('结束运行');
});

ui.accessibilityBtn.click(() => {
  if (!checkAccessibilityStatus()) {
    app.startActivity({
      action: 'android.settings.ACCESSIBILITY_SETTINGS',
    });
  }
});

ui.floatyBtn.click(async () => {
  const isOpened = await checkFloatyStatus();

  if (!isOpened) {
    openAppSetting(currentPackage());
  }
});

ui.emitter.on('resume', () => {
  checkAccessibilityStatus();
});

ui.runBtn.click(() => {
  run();
});

setTimeout(() => {
  checkAccessibilityStatus();
}, 100);
