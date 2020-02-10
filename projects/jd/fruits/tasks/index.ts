import { delayCheck } from '../../../common/delay-check';
import { killApp } from '../../../common/kill-app';
import { jdApplicationId, openJDMain } from '../../../common/open-app';
import { retryRun } from '../../../common/retry-run';
import { myScroll } from '../../../common/scroll';
import { boundsClick } from './click-ele-bounds';

function goToPage() {
  const bounds = desc('我的')
    .findOnce()
    ?.bounds();

  if (!bounds) {
    throw new Error('not in jd main page');
  }

  click(bounds.centerX(), bounds.centerY());

  const ele = delayCheck(3000, 500, () => {
    return textContains('东东农场').findOnce();
  });

  if (!ele) {
    throw new Error('can not find fruits btn');
  }

  const fruitsBounds = ele.bounds();

  click(fruitsBounds.centerX(), fruitsBounds.centerY());
  delayCheck(15000, 1000, () => {
    return textContains('c88963830485cf49').findOnce();
  });
}

function goToTask() {
  const key = '领水滴';
  if (textContains(key).findOnce()) {
    return;
  }

  // 领水任务
  boundsClick('c88963830485cf49', 1000);

  if (!textContains(key).findOnce()) {
    throw new Error(`不在[${key}]任务界面`);
  }
}

function checkPopup() {
  boundsClick('明天再来');
  boundsClick('继续领水滴');
  boundsClick('签到领水滴');
  boundsClick('我知道了');
  boundsClick('68g');
  boundsClick('我知道了');
  boundsClick('立即领取');
}

function doTasks() {
  goToTask();

  // 每日首次浇水
  boundsClick(
    textContains('每日首次浇水')
      .findOnce()
      ?.parent()
      .findOne(text('去完成')),
    1000
  );

  goToTask();

  // 领取 每日首次浇水
  boundsClick(
    textContains('每日首次浇水')
      .findOnce()
      ?.parent()
      .findOne(text('去领取'))
  );

  goToTask();

  // 定时领水
  boundsClick(
    textContains('定时领水')
      .findOnce()
      ?.parent()
      .findOne(text('去领取'))
  );

  // 弹出框处理
  checkPopup();

  // 移动下位置
  myScroll(
    textContains('收集水滴雨')
      .findOnce()
      ?.parent()
  );

  // 浏览
  for (let i = 0; i < 2; i += 1) {
    goToTask();

    const goEle = textContains('浏览')
      .findOnce()
      ?.parent()
      .findOne(text('逛逛'));

    if (goEle) {
      boundsClick(goEle);
      sleep(1000);
      back();

      goToTask();
    }

    boundsClick(text('去领取').findOnce());
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
    },
    () => {
      sleep(500);
      killApp(jdApplicationId);
    },
    retries
  );
}

export { runWithRetry };
