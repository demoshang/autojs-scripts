import { delayCheck } from '../../../common/delay-check';
import { killApp } from '../../../common/kill-app';
import { jdApplicationId, openJDMain } from '../../../common/open-app';
import { retryRun } from '../../../common/retry-run';
import { myScroll } from '../../../common/scroll';
import { boundsClick } from '../../../common/click-ele-bounds';
import { closeTaskPanel } from './close-task-panel';

function goToPage() {
  toastLog('尝试进入 [东东农场] 页面');

  console.info('搜索按钮 [我的]');
  const bounds = desc('我的')
    .findOnce()
    ?.bounds();

  if (!bounds) {
    throw new Error('not in jd main page');
  }

  boundsClick(bounds, 1000);

  console.info('搜索按钮 [东东农场]');
  const ele = delayCheck(3000, 500, () => {
    return textContains('东东农场').findOnce();
  });

  if (!ele) {
    throw new Error('can not find fruits btn');
  }

  const fruitsBounds = ele.bounds();

  console.info('点击 [东东农场]');

  boundsClick(fruitsBounds);

  console.info('等待按钮 [领取(c88963830485cf49)]');
  delayCheck(15000, 1000, () => {
    return textContains('c88963830485cf49').findOnce();
  });
}

function goToTask() {
  const key = '领水滴';
  if (
    delayCheck(2000, 500, () => {
      return textContains(key).findOnce();
    })
  ) {
    return;
  }

  toastLog(`尝试进入 [${key}] 页面`);

  console.info('点击按钮 [领取(c88963830485cf49)]');
  // 领水任务
  boundsClick('c88963830485cf49');

  console.info(`检查文字 [${key}]`);
  if (!textContains(key).findOnce()) {
    throw new Error(`不在[${key}]任务界面`);
  }
}

function checkPopup() {
  if (text('三餐福利时间到了').findOnce()) {
    boundsClick('去领取');
    toastLog('三餐福利时间到了');
    sleep(2000);
  }

  boundsClick('明天再来');
  boundsClick('继续领水滴');
  boundsClick('签到领水滴');
  boundsClick('我知道了');
  boundsClick('我知道了');
  boundsClick('立即领取');
}

function doTasks() {
  goToTask();

  // 弹出框处理
  checkPopup();

  toastLog('[每日首次浇水]');
  // 每日首次浇水
  boundsClick(
    textContains('每日首次浇水')
      .findOnce()
      ?.parent()
      .findOne(text('去完成'))
  );

  goToTask();

  toastLog('领取 [每日首次浇水]');
  // 领取 每日首次浇水
  boundsClick(
    textContains('每日首次浇水')
      .findOnce()
      ?.parent()
      .findOne(text('领取'))
  );

  goToTask();

  toastLog('[定时领水]');
  // 定时领水
  boundsClick(
    textContains('定时领水')
      .findOnce()
      ?.parent()
      .findOne(text('去领取'))
  );

  // 弹出框处理
  checkPopup();

  toastLog('[移动下位置]');
  // 移动下位置
  myScroll(
    textContains('收集水滴雨')
      .findOnce()
      ?.parent()
  );
  sleep(1000);

  // 浏览
  for (let i = 0; i < 5; i += 1) {
    goToTask();

    toastLog(`[浏览 ${i}]`);
    const taskDetailPanel = textContains('去逛逛')
      .findOnce()
      ?.parent()
      ?.parent();

    const goEle = taskDetailPanel?.findOne(textContains('去逛逛'));

    if (goEle) {
      boundsClick(goEle);
      back();

      goToTask();
    }

    toastLog('去领取');
    boundsClick(text('去领取').findOnce());

    if (taskDetailPanel) {
      myScroll(taskDetailPanel);
      sleep(1000);
    }
  }

  goToTask();
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
      doTasks();
      closeTaskPanel();
      sleep(2000);
    },
    () => {
      sleep(500);
      killApp(jdApplicationId);
    },
    '京东',
    retries
  );
}

export { runWithRetry };
