import { JD_MALL } from '@/common/app/constants';
import { openApp } from '@/common/app/open-with-check';
import { boundsClick } from '@/common/click-ele-bounds';
import { delayCheck } from '@/common/delay-check';
import { getChild } from '@/common/floaty-children';
import { killApp } from '@/common/kill-app';
import { scrollPage } from '@/common/scroll';
import { Task } from '@/common/task/Task';
import { Worker } from '@/common/task/Worker';
import { tl } from '@/common/toast';
import { $, $$, getRelativeObject } from '@/common/ui-object';

function openActivityPage() {
  tl('打开京东中');

  const isInApp = openApp({
    checkIsIn: () => {
      return !!$('我的');
    },

    packageName: JD_MALL,
    className: 'com.jingdong.app.mall.main.MainActivity',
  });

  if (!isInApp) {
    return false;
  }

  const isFoundBtn = delayCheck({
    runFirst: false,
    runFn: () => {
      boundsClick($('我的'));
    },
    checkFn: () => {
      if ($('穿行寻宝')) {
        return true;
      }
      return;
    },
  });

  if (!isFoundBtn) {
    return false;
  }

  return delayCheck({
    runFirst: false,
    runFn: () => {
      boundsClick($('穿行寻宝'));
    },
    checkFn: () => {
      if ($(/.*解锁.*次抽奖/)) {
        return true;
      }

      if ($('距离下次抽到分红')) {
        return true;
      }

      if ($(/消耗/)) {
        return true;
      }

      return false;
    },
  });
}

function l2View() {
  if (!$(/当前页.*浏览/)) {
    return false;
  }

  const root = $(/当前页.*浏览/)
    ?.parent()
    ?.parent();

  const pngs = $$(root, /.*\.(png|jpg)\!q\d+.*/);

  pngs.slice(1, 5).forEach((ele) => {
    const product = ele?.parent()?.parent();
    const goBtn = getChild(product, 4);

    boundsClick(goBtn);
    sleep(500);

    if (!$(/当前页.*浏览/)) {
      back();
      sleep(1000);
    }
  });

  return true;
}

function runTask(task: Task, index: number) {
  const pre = 1000;
  const after = 3000;

  const { intro, title, delay } = task;
  const timeout = delay + after + (index - 1) * 500;

  tl(`执行任务: `, title, intro, '执行时长: ', timeout);

  const goBtn = task.btn;
  boundsClick(goBtn);

  sleep(pre);

  if (l2View()) {
    return;
  }

  scrollPage();

  delayCheck({
    timeout,
    delay: 500,
    checkFn: () => {
      return !!$(/.*获得\d+金币.*/);
    },
    runFn: () => {
      scrollPage();
    },
    log: 1000,
    runFirst: true,
  });
}

function closeModal() {
  if ($(/.*(立即抽奖|继续环游).*/)) {
    const root = $(/.*(立即抽奖|继续环游).*/)
      ?.parent()
      ?.parent()
      ?.parent()
      ?.parent()
      ?.parent()
      ?.parent();

    const closeBtn = getChild(root, [0, 1, 0, 0]);
    boundsClick(closeBtn);
    return true;
  }

  if ($(/.*恭喜获得奖励.*/)) {
    const root = $(/.*恭喜获得奖励.*/)
      ?.parent()
      ?.parent()
      ?.parent()
      ?.parent()
      ?.parent();

    const closeBtn = getChild(root, [1, 0, 0]);
    boundsClick(closeBtn);
    return true;
  }

  const IKnow = $('我知道了');

  if (IKnow) {
    boundsClick(IKnow);
    return true;
  }

  return false;
}

function keepInTaskPage() {
  const isInTask = delayCheck({
    timeout: 15000,
    delay: 800,
    runFirst: false,
    checkFn: (timeout) => {
      if ($('当前进度') && $('去完成')) {
        return true;
      }

      if (closeModal()) {
        return false;
      }

      if ($(/消耗/)) {
        const bottomEle = $(/消耗/)?.parent()?.parent()?.parent()?.parent();

        const taskBtn = getChild(bottomEle, 3);
        boundsClick(taskBtn);
        return;
      }

      if ($('距离下次抽到分红')) {
        const bottomEle = $('距离下次抽到分红')?.parent()?.parent();
        const taskBtn = getChild(bottomEle, 3);
        boundsClick(taskBtn);
        return;
      }

      tl('返回');
      back();

      if (timeout && timeout < 3000) {
        app.launchApp(JD_MALL);
      }

      return;
    },
  });

  if (!isInTask) {
    throw new Error('保持任务界面失败');
  }
}

function queryTask(index?: number) {
  // 关闭重新打开才能刷新任务数据
  if ($('当前进度') && index && index % 3 === 0) {
    const taskPanel = $('当前进度')?.parent()?.parent()?.parent()?.parent();
    const closeBtn = getChild(taskPanel, [1, 1, 0, 0]);
    boundsClick(closeBtn);

    sleep(2000);

    keepInTaskPage();
  }

  const btnReg = /^(去完成|去浏览)$/;

  const list = $$(btnReg);

  if (!list?.length) {
    throw new Error('未找到任务');
  }

  return list
    .map((ele) => {
      return {
        btn: ele,
        container: getRelativeObject(ele, -1),
      };
    })
    .map(({ btn, container }) => {
      if (!container) {
        throw new Error('找不到 任务');
      }

      return new Task({
        container,
        title: $(container, /.*\d+\/\d+.*/)?.text() ?? '',
        btn,
      });
    });
}

function run(retries: number) {
  // console.show();

  const worker = new Worker({
    name: '京东双十一',
    runTask,
    keepInTaskPage,
    workerRetires: retries,
    taskRetires: 20,
    queryTask,
    taskSkip: (task) => {
      if (/开通.*会员/.test(task.title)) {
        return true;
      }

      // if (/小程序/.test(task.title)) {
      //   return true;
      // }

      if (/组队/.test(task.title)) {
        return true;
      }

      if (/去逛逛并下单/.test(task.title)) {
        return true;
      }

      return false;
    },

    destroy: () => {
      console.hide();
      exit();
    },

    // openApp: () => {},
    // killApp: () => {},
    openApp: openActivityPage,
    killApp: () => {
      return killApp(JD_MALL);
    },
  });

  worker.start();
}

export { run };
