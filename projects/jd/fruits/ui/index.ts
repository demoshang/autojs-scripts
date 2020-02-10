import './head';

import { checkFloaty } from '../../../common/check-floaty';
import { runWithRetry } from '../tasks';
import layout from './layout.xml';

layout();

enum Status {
  visible = 0,
  invisible = 8,
}

let canCheckFloaty = false;
const status: { [key: string]: boolean } = {};

function renderAccessibility(type: boolean) {
  if (type) {
    ui.accessibilityStatusCheck.visibility = Status.invisible;
    ui.accessibilityStatusSuccess.visibility = Status.visible;
    ui.waring.visibility = Status.invisible;
  } else {
    ui.accessibilityStatusCheck.visibility = Status.visible;
    ui.accessibilityStatusSuccess.visibility = Status.invisible;
    ui.waring.visibility = Status.visible;
  }
}

function renderFloaty(type: boolean | 'hidden') {
  if (type === 'hidden') {
    ui.floatyBtn.visibility = Status.invisible;
    ui.floatyStatusCheck.visibility = Status.invisible;
    ui.floatyStatusSuccess.visibility = Status.invisible;
  } else if (type === true) {
    ui.floatyBtn.visibility = Status.visible;
    ui.floatyStatusCheck.visibility = Status.invisible;
    ui.floatyStatusSuccess.visibility = Status.visible;
  } else if (type === false) {
    ui.floatyBtn.visibility = Status.visible;

    ui.floatyStatusCheck.visibility = Status.visible;
    ui.floatyStatusSuccess.visibility = Status.invisible;
  }
}

function render() {
  if (!status.accessibility) {
    renderAccessibility(false);
    renderFloaty('hidden');
  } else {
    renderAccessibility(true);

    renderFloaty(status.floaty);
  }

  if (status.accessibility && status.floaty) {
    ui.runBtn.visibility = Status.visible;
  } else {
    ui.runBtn.visibility = Status.invisible;
  }
}

async function checkStatus() {
  if (auto.service === null) {
    status.accessibility = false;

    status.floaty = false;
  } else {
    status.accessibility = true;

    if (!canCheckFloaty) {
      status.floaty = false;
    } else {
      status.floaty = await checkFloaty();
    }
  }

  render();
}

let threadCache: threads.Thread | null = null;

function run() {
  // 停止上次可能在运行的脚本
  if (threadCache) {
    toastLog('停止上次残留中....');
    threadCache.interrupt();
    threadCache = null;
  }

  app.startActivity('console');

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

ui.accessibilityBtn.click(async () => {
  await checkStatus();

  if (!status.accessibility) {
    app.startActivity({
      action: 'android.settings.ACCESSIBILITY_SETTINGS',
    });
  }
});

ui.floatyBtn.click(async () => {
  canCheckFloaty = true;
  await checkStatus();

  if (!status.floaty) {
    openAppSetting(currentPackage());
  }
});

ui.emitter.on('resume', () => {
  checkStatus();
});

ui.emitter.on('exit', () => {
  if (threadCache) {
    toastLog('停止上次残留中....');
    threadCache.interrupt();
    threadCache = null;
  }
});

ui.runBtn.click(() => {
  run();
});

ui.consoleBtn.click(() => {
  app.startActivity('console');
});

setTimeout(() => {
  checkStatus();
}, 100);
