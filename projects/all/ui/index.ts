import './head';

import { checkFloaty, openFloatySetting } from '../../common/floaty-permission';
import { getCaptureImage } from '../../common/image';
import { killApp } from '../../common/kill-app';
import { muteRestoreMusic } from '../../common/mute';
import { jdApplicationId, suningApplicationId } from '../../common/open-app';
import { runWithRetry as JDRun } from '../../jd/fruits/tasks';
import { runWithRetry as JD618Run } from '../../jd/200618/tasks';
import { runWithRetry as SNRun } from '../../suning/fruits/tasks';
import layout from './layout.xml';

layout();

enum Status {
  visible = 0,
  invisible = 8,
}

const status: { [key: string]: boolean } = {};

const btns = [
  {
    id: 'runALLBtn',
    type: 'all',
  },
  {
    id: 'runJDBtn',
    type: 'jd',
  },
  {
    id: 'runJD618Btn',
    type: 'jd618',
  },
  {
    id: 'runSNBtn',
    type: 'sn',
  },
];

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
    btns.forEach(({ id }) => {
      ui[id].visibility = Status.visible;
    });
  } else {
    btns.forEach(({ id }) => {
      ui[id].visibility = Status.invisible;
    });
  }
}

async function checkStatus() {
  status.accessibility = !!auto.service;
  status.floaty = checkFloaty();

  render();
}

let threadCache: threads.Thread | null = null;

function run(type: string) {
  // 停止上次可能在运行的脚本
  if (threadCache) {
    toastLog('停止上次残留中....');
    threadCache.interrupt();
    threadCache = null;
  }

  try {
    threadCache = threads.start(() => {
      const restoreMusic = muteRestoreMusic();

      if (type === 'jd') {
        JDRun();
        killApp(jdApplicationId);
      } else if (type === 'jd618') {
        JD618Run(6);
        killApp(jdApplicationId);
      } else if (type === 'sn') {
        getCaptureImage();
        SNRun();
        killApp(suningApplicationId);
      } else if (type === 'all') {
        getCaptureImage();

        JD618Run(6);
        killApp(jdApplicationId);

        JDRun();
        killApp(jdApplicationId);

        SNRun();
        killApp(suningApplicationId);
      } else {
        restoreMusic();
        throw new Error('启动任务失败, 无法识别任务类型');
      }

      restoreMusic();
    });
  } catch (e) {
    toastLog(e);
  }
}

events.on('exit', () => {
  toastLog('结束运行');
  threads.shutDownAll();
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
  await checkStatus();

  if (!status.floaty) {
    openFloatySetting();
  }
});

ui.emitter.on('resume', () => {
  checkStatus();
});

ui.emitter.on('exit', () => {
  threads.shutDownAll();
});

btns.forEach(({ id, type }) => {
  ui[id].click(() => {
    run(type);
  });
});

ui.consoleBtn.click(() => {
  app.startActivity('console');
});

setTimeout(() => {
  checkStatus();
}, 100);
