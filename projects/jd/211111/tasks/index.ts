import { boundsClick } from '../../../common/click-ele-bounds';
import { delayCheck } from '../../../common/delay-check';
import { findAndClick } from '../../../common/find-click';
import { collection2array } from '../../../common/floaty-children';
import { killApp } from '../../../common/kill-app';
import { loopRunTask } from '../../../common/loop-run-task';
import {
  jdApplicationId,
  jdJinRongId,
  openJDJR,
  openJDMain,
} from '../../../common/open-app';
import { retryRun } from '../../../common/retry-run';
import { scrollIn, scrollPage } from '../../../common/scroll';
import { tl } from '../../../common/toast';
import { getUiObject } from '../../../common/ui-object';
import { checkIsInChengCheng, doChengCheng } from './cheng-cheng';
import { checkIsViewProduct, viewProduct } from './view-product';
import { checkIsWall, doWall } from './wall';
import { checkIsZhongCao, doZhongCao } from './zhong-cao';

function checkIsInTask() {
  return !!textContains('当前进度').findOnce();
}

function closePop() {
  findAndClick({
    image: images.read('./assets/jd211111/close.png'),
    options: { threshold: 0.2 },
  });

  findAndClick({
    image: images.read('./assets/jd211111/close2.png'),
    options: { threshold: 0.2 },
  });
}

function openTaskList() {
  tl('打开任务');
  sleep(1000);

  const list = collection2array(
    getUiObject(/打卡领红包|解锁.*站/)
      ?.parent()
      ?.children(),
  );

  let btn = list[10];
  if (list[10]?.text()) {
    btn = list[9];
  }

  boundsClick(btn);
  sleep(1000);
}

function runTask(
  taskBtn: UiObject,
  delay: number,
  perMs: number,
  afterMs: number,
) {
  boundsClick(taskBtn);
  sleep(perMs);

  const isViewProduct = checkIsViewProduct();
  const isZhongCao = checkIsZhongCao();
  const isChengCheng = checkIsInChengCheng();

  if (isViewProduct) {
    viewProduct();
  } else if (isZhongCao) {
    doZhongCao();
  } else if (isChengCheng) {
    doChengCheng();
  } else {
    scrollPage();
    sleep(delay);
    sleep(afterMs);
  }
}

function checkIsSkipTask(txt: string, executedList: string[]) {
  // 任务已完成
  if (/\((\d+)\/\1\)/.test(txt)) {
    return true;
  }

  // 邀请好友
  if (/邀请好友/.test(txt)) {
    return true;
  }

  // 加入会员的任务不做
  if (/入会|开.*会员|注册.*会员/.test(txt)) {
    return true;
  }

  // 下单的任务不做
  if (/下单/.test(txt)) {
    return true;
  }

  // 已经执行过的任务 不需要
  if (
    executedList.find((v) => {
      return v === txt;
    })
  ) {
    return true;
  }

  return false;
}

function buildTaskList(executedList: string[]) {
  const list = collection2array(textMatches(/.*\(\d+\/\d+.*/).find());

  return list.filter((ele) => {
    if (!ele) {
      return false;
    }

    const txt = ele.text();
    console.log('txt: ', txt);

    if (checkIsSkipTask(txt, executedList)) {
      return false;
    }

    return true;
  });
}

function doTask(executedList: string[] = []) {
  let list = buildTaskList(executedList);

  tl('任务长度: ', list.length);

  while (list.length) {
    const ele = list.shift();

    if (!ele) {
      break;
    }

    const parent = ele.parent();
    const txt = ele.text();

    let isFinished = checkIsSkipTask(txt, executedList);

    // 添加到已执行任务中
    executedList.push(txt);

    if (/品牌墙/.test(txt)) {
      closePop();
      throwIfNotInActivity();
      runWallTask();

      isFinished = true;
    }

    if (!isFinished) {
      tl('执行任务: ', txt);

      loopRunTask({
        ele: parent,
        name: txt,
        checkIsInTask,
        getBtn: (o) => {
          return collection2array(o.children())[3];
        },
        runTask,
        waitFinished: () => {
          delayCheck(5000, 1000, () => {
            return !!(
              descMatches(/.*获得\d+汪汪币.*/).findOnce() ||
              textMatches(/.*获得\d+汪汪币.*/).findOnce()
            );
          });
        },
        afterBack: () => {
          sleep(1000);
        },
      });

      console.info('重新获取任务列表');
    }

    // 重新构建任务列表
    list = buildTaskList(executedList);
  }
}

function runWallTask() {
  openTaskList();
  sleep(3000);

  const ele = getUiObject(/品牌墙/);

  const btn = collection2array(ele?.parent()?.children())[3];

  boundsClick(btn);
  sleep(1000);

  if (checkIsWall()) {
    doWall();
  }

  scrollIn(
    () => {
      return getUiObject(/打卡领红包|解锁.*站/);
    },
    { max: 50 },
  );

  sleep(50 * 100);

  openTaskList();

  sleep(5000);
}

function checkIsInActivity() {
  return !!getUiObject(/打卡领红包|解锁.*站/);
}

function throwIfNotInActivity() {
  if (!checkIsInActivity()) {
    throw new Error('活动打开失败');
  }
}

function goToPage(isJR = false) {
  tl('尝试进入 [京东11.11] 页面');

  const btn = delayCheck(
    10000,
    1000,
    () => {
      tl('搜索按钮 [京东11.11]');
      console.info('currentPackage: ', currentPackage());

      if (isJR) {
        return idContains('redPacketIV').findOnce();
      }

      return getUiObject(/浮层活动/);
    },
    () => {
      tl('搜索按钮 [首页]');
      boundsClick(getUiObject('首页', 'dt'));
    },
  );

  if (!btn) {
    throw new Error('[京东11.11] 页面未找到');
  }

  tl('点击 [京东11.11]');

  delayCheck(
    15000,
    1000,
    () => {
      return getUiObject(/打卡领红包|解锁.*站/);
    },
    () => {
      boundsClick(btn);
    },
  );
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

      closePop();
      throwIfNotInActivity();

      openTaskList();
      doTask();

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

  retryRun(
    () => {
      tl('打开京东金融中');
      const isOpenSuccess = openJDJR();
      if (!isOpenSuccess) {
        throw new Error('open jd jr failed');
      }

      goToPage(true);
      throwIfNotInActivity();

      closePop();
      throwIfNotInActivity();

      openTaskList();
      doTask();

      sleep(2000);

      throw new Error('强制重试');
    },
    () => {
      sleep(1000);
      killApp(jdJinRongId);
    },
    '京东金融',
    retries,
  );
}

export { runWithRetry, goToPage };
