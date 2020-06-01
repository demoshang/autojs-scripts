import { boundsClick } from '../../../common/click-ele-bounds';
import { delayCheck } from '../../../common/delay-check';
import { collection2array } from '../../../common/floaty-children';
import { floatyDebug } from '../../../common/floaty-debug';
import { getTaskCount, getTaskDelay } from '../../../common/get-task-count';
import { killApp } from '../../../common/kill-app';
import { openTaoBaoMain, taobaoId } from '../../../common/open-app';
import { retryRun } from '../../../common/retry-run';
import { scrollPage } from '../../../common/scroll';

function goToPage() {
  toastLog('尝试进入 [瓜分10亿] 页面');

  const pageBtn = delayCheck(
    10000,
    1000,
    () => {
      toastLog('搜索按钮 [瓜分10亿]');
      return textContains('瓜分10亿').findOnce();
    },
    () => {
      toastLog('搜索按钮 [我的]');
      const ele =
        id('android:id/tabs').findOnce() ||
        id('com.taobao.taobao:id/iv_btn_background')
          .findOnce()
          ?.parent()
          .parent()
          .parent();

      if (!ele) {
        return;
      }

      const btn = collection2array(ele.children()).pop();
      boundsClick(btn);
    }
  );

  if (!pageBtn) {
    throw new Error('[瓜分10亿] 页面未找到');
  }

  toastLog('点击 [瓜分10亿]');
  boundsClick(pageBtn);

  toastLog('等待进入 [瓜分10亿]');
  sleep(3000);
}

function checkIsInTask() {
  return !!textContains('淘宝成就点').findOnce();
}

function throwIfNotInTask() {
  if (!checkIsInTask()) {
    throw new Error('任务面板打开失败');
  }
}

function openTask() {
  if (checkIsInTask()) {
    console.info('在任务面板中');
    return;
  }

  const ele = textContains('领喵币').findOnce();

  if (!ele) {
    throw new Error('no task found');
  }

  boundsClick(ele);

  throwIfNotInTask();
}

function toFinishTask(
  ele: UiObject,
  taskName: string,
  lastResult?: {
    total: number;
    completed: number;
    left: number;
    retries: number;
    max: number;
  }
) {
  floatyDebug(ele);

  if (!ele.text()) {
    return;
  }

  const taskBtn = ele?.findOne(textMatches(/去(完成|浏览)/));
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
  } else if (lastResult && lastResult.left + 1 === taskCount.left) {
    // eslint-disable-next-line no-param-reassign
    lastResult.retries = 0;
  }

  console.info({
    taskCount,
    delay,
    retries: lastResult?.retries,
    max: lastResult?.max,
  });

  boundsClick(taskBtn);

  scrollPage();

  sleep(3000);
  sleep(delay);

  if (!textContains('任务完成').findOnce()) {
    console.warn('任务 未 完成, 延迟3秒');
    sleep(3000);
  }

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

  toFinishTask(ele, taskName, {
    ...taskCount,
    retries: ((lastResult && lastResult.retries) || 0) + 1,
    max: (lastResult && lastResult.max) || taskCount.left + 1,
  });
}

function doTasks() {
  openTask();

  collection2array(textMatches(/.*浏览\d+秒.*得\d+喵币.*/).find()).forEach((ele, index) => {
    const parent = ele.parent();

    if (parent.findOne(textMatches(/去(完成|浏览)/))) {
      toFinishTask(parent, `${index}`);
    }
  });
}

function runWithRetry(retries = 3) {
  retryRun(
    () => {
      app.startActivity('settings');
      sleep(1000);
      back();

      toastLog('打开淘宝中');
      const isOpenSuccess = openTaoBaoMain();
      if (!isOpenSuccess) {
        throw new Error('open taoBao failed');
      }
      goToPage();

      doTasks();

      sleep(2000);
    },
    () => {
      sleep(1000);
      killApp(taobaoId);
    },
    '淘宝',
    retries
  );
}

export { runWithRetry };
