import { boundsClick } from '../../../common/click-ele-bounds';
import { delayCheck, delayRun } from '../../../common/delay-check';
import { floatyDebug } from '../../../common/floaty-debug';
import { getTaskCount, getTaskDelay } from '../../../common/get-task-count';
import { killApp } from '../../../common/kill-app';
import { jdApplicationId, openJDMain } from '../../../common/open-app';
import { retryRun } from '../../../common/retry-run';
import { getUiObject } from '../../../common/ui-object';

function goToPage() {
  toastLog('尝试进入 [叠蛋糕] 页面');

  const cakeBtn = delayCheck(
    10000,
    1000,
    () => {
      toastLog('搜索按钮 [叠蛋糕]');
      console.info('currentPackage: ', currentPackage());
      return textContains('叠蛋糕')
        .findOnce()
        ?.parent();
    },
    () => {
      toastLog('搜索按钮 [我的]');
      boundsClick(desc('我的').findOnce());
    }
  );

  if (!cakeBtn) {
    throw new Error('[叠蛋糕] 页面未找到');
  }

  toastLog('点击 [叠蛋糕]');
  boundsClick(cakeBtn);

  toastLog('等待进入 [叠蛋糕]');
  sleep(3000);
}

function checkIsInTask() {
  return !!textContains('任务每日0点刷新').findOnce();
}

function throwIfNotInTask() {
  if (!checkIsInTask()) {
    throw new Error('任务面板打开失败');
  }
}

function checkIsInActivity() {
  return !!textContains('做任务领金币').findOnce();
}

function throwIfNotInActivity() {
  if (!checkIsInActivity()) {
    throw new Error('活动打开失败');
  }
}

function collectCoin() {
  let ele = idContains('goldElfin').findOnce();

  while (ele !== null) {
    boundsClick(ele, 100);
    ele = idContains('goldElfin').findOnce();
  }
}

function toFinishTask(
  taskName: string | RegExp,
  lastResult?: {
    total: number;
    completed: number;
    left: number;
    retries: number;
    max: number;
  }
) {
  const ele = getUiObject(taskName)
    ?.parent()
    ?.parent();

  if (!ele) {
    return;
  }

  floatyDebug(ele);

  const taskBtn = ele?.findOne(textContains('去完成'));
  const taskCount = getTaskCount(ele, taskName);
  const delay = getTaskDelay(ele);

  if (taskCount.left === 0) {
    return;
  }

  if (lastResult && lastResult.left === taskCount.left) {
    if (lastResult.retries > lastResult.max) {
      toastLog(`⚠️警告: ${taskName} 任务失败`);
      return;
    }
  }

  console.info({
    taskCount,
    delay,
    retries: lastResult?.retries,
    max: lastResult?.max,
  });

  boundsClick(taskBtn);

  if (getUiObject(taskName)) {
    console.warn('进入任务失败');
    return;
  }

  sleep(3000);
  sleep(delay);

  const isInTask = delayCheck(
    4000,
    1000,
    () => {
      return checkIsInTask();
    },
    () => {
      back();
      sleep(1000);
    }
  );

  if (!isInTask) {
    throw new Error('不在任务面板');
  }

  toFinishTask(taskName, {
    ...taskCount,
    retries: ((lastResult && lastResult.retries) || 0) + 1,
    max: (lastResult && lastResult.max) || taskCount.left + 1,
  });
}

function openTask() {
  if (textContains('任务每日0点刷新').findOnce()) {
    console.info('在任务面板中');
    return;
  }

  const ele = textContains('做任务领金币').findOnce();

  if (!ele) {
    throw new Error('no task found');
  }

  boundsClick(ele);

  throwIfNotInTask();
}

function closeTask() {
  if (checkIsInTask()) {
    boundsClick(textContains('x6YonE079h84lBpxnX4CVJaqei7TKx8AAAAASUVORK5CYII=').findOnce());
  }

  if (checkIsInTask() || !checkIsInActivity()) {
    throw new Error('close task failed');
  }
}

function signIn() {
  toastLog('签到');
  boundsClick(textContains('签到').findOnce());
}

function popup() {
  toastLog('弹出框处理');
  boundsClick(textContains('立即签到').findOnce());
}

function loopCollectCoin() {
  toastLog('金币采集');

  if (checkIsInTask()) {
    closeTask();
  }

  if (checkIsInTask()) {
    throw new Error('not in CollectCoin page');
  }

  delayRun(
    3000,
    () => {
      collectCoin();
    },
    () => {
      return !!idContains('goldElfin').findOnce();
    }
  );
}

function doTasks() {
  openTask();

  signIn();

  throwIfNotInTask();

  toFinishTask('去逛618主会场');
  toFinishTask(/浏览.*\).*/);
  toFinishTask(/去逛.*店.*/);
  toFinishTask(/.*去逛.*\d+秒.*[\d-]+金币.*/);
  toFinishTask(/.*浏览\d+秒.*可得[\d-]+金币.*/);
}

function runWithRetry(retries = 3) {
  retryRun(
    () => {
      toastLog('打开京东中');
      const isOpenSuccess = openJDMain();
      if (!isOpenSuccess) {
        throw new Error('open jd failed');
      }
      goToPage();

      throwIfNotInActivity();

      popup();

      loopCollectCoin();

      popup();

      throwIfNotInActivity();

      doTasks();

      sleep(2000);
    },
    () => {
      sleep(1000);
      killApp(jdApplicationId);
    },
    '京东',
    retries
  );
}

export { runWithRetry };
