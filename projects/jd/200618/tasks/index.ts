import { boundsClick } from '../../../common/click-ele-bounds';
import { delayCheck, delayRun } from '../../../common/delay-check';
import { collection2array } from '../../../common/floaty-children';
import { floatyDebug } from '../../../common/floaty-debug';
import { getTaskCount } from '../../../common/get-task-count';
import { checkInScreen } from '../../../common/in-screen';
import { killApp } from '../../../common/kill-app';
import { loopRunTask } from '../../../common/loop-run-task';
import { jdApplicationId, openJDMain } from '../../../common/app/old-open-app';
import { retryRun } from '../../../common/retry-run';
import { myScroll, scrollIn } from '../../../common/scroll';
import { tl } from '../../../common/toast';
import { getUiObject } from '../../../common/ui-object';

function goToPage() {
  tl('尝试进入 [叠蛋糕] 页面');

  const cakeBtn = delayCheck({
    timeout: 10000,
    delay: 1000,
    checkFn: () => {
      tl('搜索按钮 [叠蛋糕]');
      console.info('currentPackage: ', currentPackage());
      return textContains('叠蛋糕').findOnce()?.parent();
    },
    runFn: () => {
      tl('搜索按钮 [我的]');
      boundsClick(desc('我的').findOnce());
    },
  });

  if (!cakeBtn) {
    throw new Error('[叠蛋糕] 页面未找到');
  }

  tl('点击 [叠蛋糕]');
  boundsClick(cakeBtn);

  tl('等待进入 [叠蛋糕]');
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
  let nu = 0;

  while (ele !== null && nu < 10) {
    boundsClick(ele, 100);
    nu += 1;
    ele = idContains('goldElfin').findOnce();
  }
}

function toFinishTask(taskName: string | RegExp) {
  loopRunTask({
    getEle: () => {
      return getUiObject(taskName)?.parent()?.parent();
    },
    name: taskName.toString(),
    checkIsInTask,
    getBtn: (ele) => {
      return ele?.findOne(textContains('去完成'));
    },
    waitFinished: () => {
      delayCheck({
        timeout: 8000,
        delay: 500,
        checkFn: () => {
          return !!(
            descMatches(/.*恭喜完成.*/).findOnce() ||
            textMatches(/.*恭喜完成.*/).findOnce()
          );
        },
      });
    },
    afterMs: 3000,
    afterBack: () => {
      sleep(1000);
    },
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
    boundsClick(
      textContains(
        'x6YonE079h84lBpxnX4CVJaqei7TKx8AAAAASUVORK5CYII=',
      ).findOnce(),
    );
  }

  if (checkIsInTask() || !checkIsInActivity()) {
    throw new Error('close task failed');
  }
}

function signIn() {
  tl('签到');
  boundsClick(textContains('签到').findOnce());
}

function popup() {
  tl('弹出框处理');
  boundsClick(textContains('继续叠蛋糕').findOnce());
  boundsClick(textContains('立即签到').findOnce());
}

function loopCollectCoin() {
  tl('金币采集');

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
      popup();

      if (checkIsInTask()) {
        closeTask();
      }

      return !!idContains('goldElfin').findOnce();
    },
  );
}

function addToCart() {
  const arr = collection2array(idContains('cart_').find());

  arr.slice(0, 5).forEach((item) => {
    scrollIn(item);

    const ele = idContains(item.id()).findOnce();
    boundsClick(ele);
    sleep(1000);
  });
}

function cleanCart() {
  if (
    currentActivity() !== 'com.jingdong.app.mall.MainFrameActivity' ||
    !className('android.view.View').descContains('购物车').findOnce()
  ) {
    killApp(jdApplicationId);
    if (!openJDMain()) {
      throw new Error('open jd failed');
    }
  }

  const editBtn = delayCheck({
    timeout: 10000,
    delay: 1000,
    checkFn: () => {
      tl('搜索按钮 [编辑]');
      return textContains('编辑').findOnce();
    },
    runFn: () => {
      tl('搜索按钮 [购物车]');
      boundsClick(descContains('购物车').findOnce());
    },
  });

  if (!editBtn) {
    throw new Error('[购物车] 页面未找到');
  }

  tl('点击 [编辑]');
  boundsClick(editBtn);

  tl('[编辑]');
  sleep(1000);

  for (let i = 0; i < 10; i += 1) {
    boundsClick(collection2array(textMatches(/^删除$/).find()).pop());
    sleep(1000);

    if (textContains('确认要删除这').findOnce()) {
      boundsClick(textContains('确定').findOnce());
      sleep(1000);
    } else {
      break;
    }
  }
}

function doCartTask(
  taskName: string | RegExp,
  lastResult?: {
    total: number;
    completed: number;
    left: number;
    retries: number;
    max: number;
  },
) {
  const ele = getUiObject(taskName)?.parent().parent();

  if (!ele) {
    return;
  }

  const taskBtn = ele.findOne(textContains('去完成'));
  const taskCount = getTaskCount(ele);

  if (!taskBtn) {
    tl(`⚠️警告: ${taskName} 任务失败, 未找到任务按钮`);
    return;
  }

  if (!taskCount) {
    tl(`⚠️警告: ${taskName} 任务失败, 未找到任务数据`);
    return;
  }

  if (taskCount.left === 0) {
    return;
  }

  if (lastResult && lastResult.left === taskCount.left) {
    if (lastResult.retries > lastResult.max) {
      tl(`⚠️警告: ${taskName} 任务失败`);
      return;
    }
  }

  console.info({
    taskCount,
    retries: lastResult?.retries,
    max: lastResult?.max,
  });

  boundsClick(taskBtn);

  if (!getUiObject(taskName)) {
    console.warn('进入任务失败');
  }

  addToCart();

  // 返回任务界面
  boundsClick(idContains('fe').findOnce());
  sleep(3000);

  if (!checkIsInTask()) {
    throw new Error('不在任务面板');
  }

  doCartTask(taskName, {
    ...taskCount,
    retries: (lastResult?.retries || 0) + 1,
    max: lastResult?.max || taskCount.left + 1,
  });
}

function doSeriesTask(
  taskName: string | RegExp,
  lastResult?: {
    total: number;
    completed: number;
    left: number;
    retries: number;
    max: number;
  },
) {
  const ele = getUiObject(taskName)?.parent().parent();

  if (!ele) {
    return;
  }

  const taskBtn = ele.findOne(textContains('去完成'));
  const taskCount = getTaskCount(ele);

  if (!taskBtn) {
    tl(`⚠️警告: ${taskName} 任务失败, 未找到任务按钮`);
    return;
  }

  if (!taskCount) {
    tl(`⚠️警告: ${taskName} 任务失败, 未找到任务数据`);
    return;
  }

  if (taskCount.left === 0) {
    return;
  }

  if (lastResult && lastResult.left === taskCount.left) {
    if (lastResult.retries > lastResult.max) {
      tl(`⚠️警告: ${taskName} 任务失败`);
      return;
    }
  }

  console.info({
    taskCount,
    retries: lastResult?.retries,
    max: lastResult?.max,
  });

  boundsClick(taskBtn);

  if (!getUiObject('浏览以下')) {
    console.warn('进入任务失败');
    return;
  }

  const arr = collection2array(textMatches(/¥\d+\.\d{2,2}/).find());

  arr.slice(0, 5).forEach((item, index) => {
    if (!checkInScreen(item)) {
      myScroll(arr[index - 1].parent().parent(), 1000);
    }

    floatyDebug(item.parent());
    boundsClick(collection2array(textMatches(/¥\d+\.\d{2,2}/).find())[index]);
    back();
    sleep(1500);
  });

  // 返回任务界面
  boundsClick(idContains('fe').findOnce());
  sleep(3000);

  if (!checkIsInTask()) {
    throw new Error('不在任务面板');
  }

  doSeriesTask(taskName, {
    ...taskCount,
    retries: (lastResult?.retries || 0) + 1,
    max: lastResult?.max || taskCount.left + 1,
  });
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
  toFinishTask(/.*浏览可得[\d-]+金币.*/);

  doSeriesTask('成功浏览5个商品可得');
}

function runWithRetry(retries = 3): void {
  retryRun(
    () => {
      tl('打开京东中');
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

      doCartTask(/.*成功加购\d+个.*/);

      cleanCart();

      sleep(2000);

      throw new Error('强制重试');
    },
    () => {
      sleep(1000);
      killApp(jdApplicationId);
    },
    '京东',
    retries,
  );
}

export { runWithRetry };
