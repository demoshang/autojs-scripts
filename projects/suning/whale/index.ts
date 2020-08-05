import { boundsClick } from '../../common/click-ele-bounds';
import { delayCheck } from '../../common/delay-check';
import { collection2array } from '../../common/floaty-children';
import { killApp } from '../../common/kill-app';
import { openSuning, suningApplicationId } from '../../common/open-app';
import { retryRun } from '../../common/retry-run';
import { scrollIn, scrollPage } from '../../common/scroll';
import { tl } from '../../common/toast';
import { getTaskCount } from '../../common/get-task-count';

function checkIsFinished() {
  return (
    textContains('返回领取').findOnce() ||
    textContains('今日任务已完成').findOnce() ||
    textContains('今日任务完成').findOnce()
  );
}

function runTask(taskBtn: UiObject, delay = 10) {
  boundsClick(taskBtn);

  sleep(1000);

  if (checkIsFinished()) {
    return;
  }

  sleep(1000);

  const closedBtn = idContains('btn_closed').findOnce();
  if (closedBtn) {
    closedBtn.click();
  }

  scrollPage();
  sleep(delay);
}

function waitFinished(wait = 12000, interval = 1000) {
  delayCheck(wait, interval, () => {
    return checkIsFinished();
  });
}

function doTasks() {
  for (let i = 0; i < 60; i += 1) {
    tl(`第 ${i} 次处理`);

    const data = getTaskCount(textContains('已领奖店铺').findOnce());
    tl('已领奖店铺', data);

    if (data && data.left === 0) {
      break;
    }

    const taskBtn = scrollIn(
      () => {
        return collection2array(textContains('+100').find()).shift();
      },
      { max: i === 0 ? 20 : 10, swipeDuration: 500 }
    );

    if (!taskBtn) {
      tl('没有任务');
      break;
    }

    runTask(taskBtn, 0);
    waitFinished(12000);

    const isInTask = delayCheck(
      5000,
      1000,
      () => {
        return text('+100').findOnce() || textContains('今日已领').findOnce();
      },
      () => {
        back();
        sleep(1000);
      }
    );

    if (!isInTask) {
      throw new Error('not in task');
    }
  }
}

// function openTaskPanel() {
//   const parent = textContains('每天9点开启')
//     .findOnce()
//     ?.parent()
//     .parent();

//   collection2array(parent?.children())[7]?.click();
// }

function runWithRetry(retries = 3) {
  retryRun(
    () => {
      app.startActivity('settings');
      sleep(1000);
      back();
      tl('打开苏宁中...');
      openSuning('https://c.m.suning.com/snWhale.html#/', 3000);

      const isSuccess = delayCheck(15000, 1000, () => {
        return textContains('天天发现鲸').findOnce() && textContains('领奖店铺').findOnce();
      });

      if (!isSuccess) {
        throw new Error('进入苏宁失败');
      }

      sleep(1000);

      doTasks();

      for (let i = 0; i < 10; i += 1) {
        swipe(device.width / 2, device.height / 4, device.width / 2, (device.height * 3) / 4, 100);
      }

      sleep(1000);

      // collect();
    },
    () => {
      sleep(1000);
      killApp(suningApplicationId);
    },
    '苏宁',
    retries
  );
}

export { runWithRetry };
