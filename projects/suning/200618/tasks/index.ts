import { boundsClick } from '../../../common/click-ele-bounds';
import { delayCheck } from '../../../common/delay-check';
import { collection2array } from '../../../common/floaty-children';
import { floatyDebug } from '../../../common/floaty-debug';
import { killApp } from '../../../common/kill-app';
import { openSuning, suningApplicationId } from '../../../common/open-app';
import { retryRun } from '../../../common/retry-run';
import { scrollIn, scrollOut, scrollPage } from '../../../common/scroll';
import { tl } from '../../../common/toast';

function runTask(position: { x: number; y: number }, delay = 10) {
  click(position.x, position.y);
  sleep(3000);
  scrollPage();
  sleep(delay);
}

function waitFinished() {
  delayCheck(5000, 1000, () => {
    return textContains('返回领取').findOnce();
  });
}

function doTasks() {
  for (let i = 0; i < 30; i += 1) {
    const taskBtnArr = collection2array(textContains('+50').find()).filter(
      (ele) => {
        return ele.parent().parent().text() === ele.text();
      }
    );

    const taskBtn = taskBtnArr.shift();
    const position = scrollIn(taskBtn, { max: 10 });
    if (!position) {
      return;
    }
    floatyDebug(position);
    sleep(1000);
    runTask(position);
    waitFinished();

    const isInTask = delayCheck(
      5000,
      1000,
      () => {
        return textContains('+50').findOnce();
      },
      () => {
        back();
        sleep(1000);
      }
    );

    if (!isInTask) {
      throw new Error('not in task');
    }

    sleep(3000);
  }
}

function collect() {
  for (let i = 0; i < 15; i += 1) {
    const arr = collection2array(textContains('X50').find());

    arr.forEach((ele) => {
      boundsClick(ele);
    });

    if (arr.length) {
      sleep(3000);
    }
  }
}

function runWithRetry(retries = 3): void {
  retryRun(
    () => {
      app.startActivity('settings');
      sleep(1000);
      back();
      tl('打开苏宁中');
      openSuning('https://c.m.suning.com/snWhale.html#/', 5000);

      const isSuccess = delayCheck(15000, 1000, () => {
        return textContains('点击收鲸币').findOnce();
      });

      if (!isSuccess) {
        throw new Error('进入苏宁失败');
      }

      sleep(1000);

      scrollOut(textContains('点击收鲸币').findOnce());

      doTasks();

      const ele = collection2array(textContains('X50').find())
        .sort((a, b) => {
          return a.bounds().bottom - b.bounds().bottom;
        })
        .shift();

      floatyDebug(ele);

      for (let i = 0; i < 10; i += 1) {
        swipe(
          device.width / 2,
          device.height / 4,
          device.width / 2,
          (device.height * 3) / 4,
          100
        );
      }

      sleep(1000);

      collect();
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
