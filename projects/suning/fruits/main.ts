'ui';

import { checkFloaty } from '../../common/check-floaty';
import { getUi } from '../../common/get-ui';

getUi('gui');

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
      __RUN_TASK__();
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
  const a = await checkFloaty();

  if (!a) {
    app.startActivity({
      action: 'android.settings.SYSTEM_ALERT_WINDOW',
    });
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
}, 1000);
