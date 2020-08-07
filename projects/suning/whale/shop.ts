import { boundsClick } from '../../common/click-ele-bounds';
import { delayCheck } from '../../common/delay-check';
import { collection2array } from '../../common/floaty-children';
import { getTaskCount } from '../../common/get-task-count';
import { scrollIn, scrollPage } from '../../common/scroll';
import { tl } from '../../common/toast';

function checkIsFinished() {
  return (
    textContains('返回领取').findOnce() ||
    textContains('今日任务已完成').findOnce() ||
    textContains('今日任务完成').findOnce()
  );
}

function waitFinished(wait = 12000, interval = 1000) {
  delayCheck(wait, interval, () => {
    return checkIsFinished();
  });
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

function doShop() {
  // 苏宁刷新不够及时, 导致会获取上一次的数据, 所以30个店铺需要60次
  for (let i = 0; i < 60; i += 1) {
    tl(`第 ${i} 次处理`);

    // 目前也有缓存, 不会刷新这个次数
    // 主要是为了在某次崩溃再次进入时, 可以加快检测
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

    if (
      textContains('今日任务已完成').findOnce() ||
      textContains('今日任务完成').findOnce()
    ) {
      break;
    }
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

export { doShop };
