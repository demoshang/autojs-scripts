import { buildJdJR, buildJdMall } from '@/common/app/open-kill';
import { boundsClick } from '@/common/click-ele-bounds';
import { delayCheck } from '@/common/delay-check';
import { findAndClick } from '@/common/find-click';
import { checkInScreen } from '@/common/in-screen';
import { scrollIn, scrollPage } from '@/common/scroll';
import { Task } from '@/common/task/Task';
import { Worker } from '@/common/task/Worker';
import { tl } from '@/common/toast';
import { $ } from '@/common/ui-object';
import { checkIsInChengCheng, doChengCheng } from './cheng-cheng';
import { checkIsViewProduct, viewProduct } from './view-product';
import { checkIsWall, doWall } from './wall';
import { checkIsZhongCao, doZhongCao } from './zhong-cao';

const RED_PACKET_REGEX = /打卡领红包|解锁.*站/;

function checkIsInJDMainPages() {
  return !!($('首页') && $('我的') && $('购物车'));
}

function checkIsInJDJRMainPages() {
  return !!$('#iv_fifth_icon');
}

function checkIsInMainPages() {
  return checkIsInJDMainPages() || checkIsInJDJRMainPages();
}

function openActivity() {
  const isHaveActivityBtn = delayCheck({
    timeout: 10000,
    delay: 500,
    checkFn: () => {
      // 京东商城
      if (checkIsInJDMainPages()) {
        return $(/浮层活动/);
      }

      // 京东金融
      if (checkIsInJDJRMainPages()) {
        return $('瓜分20');
      }

      return null;
    },
    runFn: () => {
      const b1 = $('#iv_fifth_icon');
      const b2 = $('首页', ['desc', 'text'])?.parent();

      // 京东金融    京东商城
      boundsClick(b1 ?? b2);
    },
  });

  if (!isHaveActivityBtn) {
    throw new Error('寻找活动按钮失败');
  }

  const isOpen = !!delayCheck({
    timeout: 15000,
    delay: 1000,
    checkFn: () => {
      return $(RED_PACKET_REGEX);
    },
    runFn: () => {
      if (checkIsInJDMainPages()) {
        boundsClick($(/浮层活动/));
      } else if (checkIsInJDJRMainPages()) {
        boundsClick($('瓜分20'));
      }
    },
  });

  if (!isOpen) {
    throw new Error('进入活动页面失败');
  }
}

function closePop() {
  try {
    findAndClick({
      image: images.read('./assets/jd211111/close.png'),
      options: { threshold: 0.2 },
    });
  } catch (e) {}

  try {
    findAndClick({
      image: images.read('./assets/jd211111/close2.png'),
      options: { threshold: 0.2 },
    });
  } catch (e) {}
}

function checkIsInActivity() {
  return $(RED_PACKET_REGEX);
}

function openTask() {
  let ele = $(RED_PACKET_REGEX);

  if (!checkInScreen(ele)) {
    scrollIn(
      () => {
        return $(RED_PACKET_REGEX);
      },
      { max: 50 },
    );

    ele = $(RED_PACKET_REGEX);
  }

  if (!ele) {
    throw new Error('找不到任务按钮');
  }

  const bounds = ele.bounds();
  const x = bounds.right + (device.width - bounds.right) / 2;
  const y = bounds.centerY();

  boundsClick({ x, y });

  const isOpen = delayCheck({
    timeout: 3000,
    delay: 500,
    checkFn: () => {
      return $('当前进度');
    },
  });

  if (!isOpen) {
    throw new Error('打开任务失败');
  }
}

function checkIsInTask() {
  return !!$('当前进度');
}

function keepInTaskPage() {
  const isInTask = delayCheck({
    timeout: 15000,
    delay: 800,
    checkFn: () => {
      if (checkIsInTask()) {
        return true;
      }

      if (checkIsInActivity()) {
        tl('在活动页, 打开任务列表');
        closePop();
        sleep(1000);
        openTask();
      } else if (checkIsInMainPages()) {
        tl('在首页, 打开活动界面');
        openActivity();
      } else {
        tl('返回');
        back();
      }

      return;
    },
  });

  if (!isInTask) {
    throw new Error('保持任务界面失败');
  }
}

function taskSkip(task: Task) {
  const title = task.title;

  // 邀请好友
  if (/邀请好友/.test(title)) {
    return true;
  }

  // 加入会员的任务不做
  if (/入会|开.*会员|注册.*会员/.test(title)) {
    return true;
  }

  // 下单的任务不做
  if (/下单/.test(title)) {
    return true;
  }

  return false;
}

function runTask(
  task: Task,
  index: number,
  pre = 1000,
  after = 5000,
  afterRun = (_: Task) => {},
): void {
  const { intro, title, delay } = task;

  tl(`执行任务: `, title, intro);

  const goBtn = task.btn;

  boundsClick(goBtn);
  sleep(pre);

  const isViewProduct = checkIsViewProduct();
  const isZhongCao = checkIsZhongCao();
  const isChengCheng = checkIsInChengCheng();
  const isWall = checkIsWall();

  if (checkIsInTask()) {
    return;
  } else if (isViewProduct) {
    viewProduct();
  } else if (isZhongCao) {
    doZhongCao();
  } else if (isChengCheng) {
    doChengCheng();
  } else if (isWall) {
    doWall();
  } else {
    scrollPage();
  }

  sleep(delay);

  if (index > 1) {
    delayCheck({
      timeout: after * (index - 1),
      delay: 500,
      checkFn: () => {
        return !!$(/得\d+汪汪币/);
      },
      runFn: () => {
        scrollPage();
      },
    });
  }

  afterRun(task);
}

function runJDMall(retries: number) {
  const worker = new Worker({
    name: '京东',
    runTask,
    keepInTaskPage,
    taskSkip,
    workerRetires: retries,

    ...buildJdMall(),
  });

  worker.start();
}

function runJDJR(retries: number) {
  const worker = new Worker({
    name: '京东金融',

    runTask,
    keepInTaskPage,
    taskSkip,
    workerRetires: retries,

    ...buildJdJR(),
  });

  worker.start();
}

export { runJDMall, runJDJR };
