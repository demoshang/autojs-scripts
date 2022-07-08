import { boundsClick } from '@/common/click-ele-bounds';
import { delayCheck } from '@/common/delay-check';
import { statusBarHeight } from '@/common/floaty-debug';
import { keepInDynamic } from '@/common/in-screen';
import { killApp } from '@/common/kill-app';
import { scrollPage } from '@/common/scroll';
import { Task } from '@/common/task/Task';
import { Worker } from '@/common/task/Worker';
import { tl } from '@/common/toast';
import { $, $$ } from '@/common/ui-object';

function checkIsInTask() {
  return delayCheck({
    timeout: 5000,
    delay: 800,
    checkFn: () => {
      if ($('吃货豆') && $('逛逛任务')) {
        return true;
      }

      return;
    },
  });
}

function openActivityPage() {
  tl('打开饿了么中');

  app.startActivity({
    packageName: 'me.ele',
    data: 'eleme://web?&url=https://h5.ele.me/svip/task-list',
  });

  return checkIsInTask();
}

function keepInTaskPage() {
  const isInTask = delayCheck({
    timeout: 15000,
    delay: 800,
    runFirst: false,
    checkFn: (timeout) => {
      if ($('吃货豆') && $('逛逛任务')) {
        return true;
      }

      const IKnow = $('我知道了');

      if (IKnow) {
        boundsClick(IKnow);
      }

      tl('返回');
      back();

      if (timeout && timeout < 3000) {
        app.launchApp('me.ele');
      }

      return;
    },
  });

  if (!isInTask) {
    throw new Error('保持任务界面失败');
  }
}

function runTask(task: Task, index: number) {
  const pre = 1000;
  const after = 3000;

  const { intro, title, delay } = task;
  const timeout = delay + after * (index - 1) ** 2;

  tl(`执行任务: `, title, intro, '执行时长: ', timeout);

  const goBtn = task.btn;
  const headBounds = $('做任务赚吃货豆')?.parent()?.bounds();

  if (
    !keepInDynamic(
      () => {
        if (!goBtn || !title) {
          return null;
        }

        return $($(title)?.parent(), goBtn?.text());
      },
      {
        x: headBounds?.left ?? 0,
        y:
          (headBounds?.top ?? 0) +
          (headBounds?.height() ?? 0) +
          (goBtn?.bounds()?.height() ?? 0) +
          statusBarHeight,
      },
    )
  ) {
    tl('任务超出屏幕, 先滚动...');
    return;
  }

  boundsClick(goBtn);

  sleep(pre);
  scrollPage();

  delayCheck({
    timeout,
    delay: 500,
    checkFn: () => {
      return !!$('点击返回');
    },
    runFn: () => {
      scrollPage();
    },
    log: 1000,
    runFirst: true,
  });
}

function queryTask() {
  const ele = $('逛逛任务')?.parent();

  const btnReg = /^(去完成|去逛逛|去浏览)$/;

  const list = $$(ele, btnReg);

  if (!list?.length) {
    throw new Error('未找到任务');
  }

  return list
    .map((ele) => {
      return ele.parent();
    })
    .map((container) => {
      return new Task({
        container,
        title: $(container, /\+\d+/)?.text() ?? '',
        btn: $(container, btnReg),
        taskCount: (container) => {
          let rest = 1;
          if (!$(container, btnReg)) {
            rest = 0;
          }

          return {
            total: 1,
            completed: 1 - rest,
            left: rest,
          };
        },
      });
    });
}

function run(retries: number) {
  console.show();

  const worker = new Worker({
    name: '饿了么',
    runTask,
    keepInTaskPage,
    workerRetires: retries,
    queryTask,

    destroy: () => {
      console.hide();
      exit();
    },

    // openApp: () => {},
    // killApp: () => {},
    openApp: openActivityPage,
    killApp: () => {
      return killApp('me.ele');
    },
  });

  worker.start();
}

export { run };
