import { boundsClick } from '@/common/click-ele-bounds';
import { delayCheck } from '@/common/delay-check';
import { floatyDebug } from '@/common/floaty-debug';
import { checkInScreen } from '@/common/in-screen';
import { killApp } from '@/common/kill-app';
import { scrollIn, scrollPage } from '@/common/scroll';
import { Task } from '@/common/task/Task';
import { Worker } from '@/common/task/Worker';
import { tl } from '@/common/toast';
import { $, $$ } from '@/common/ui-object';

function checkIsInTask() {
  return delayCheck(5000, 800, () => {
    if ($('吃货豆') && $('逛逛任务')) {
      return true;
    }

    return;
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
  const isInTask = delayCheck(15000, 800, (timeout) => {
    if ($('吃货豆') && $('逛逛任务')) {
      return true;
    }

    tl('返回');
    back();

    if (timeout && timeout < 3000) {
      app.launchApp('me.ele');
    }

    return;
  });

  if (!isInTask) {
    throw new Error('保持任务界面失败');
  }
}

function runTask(task: Task, index: number) {
  const pre = 1000;
  const after = 3000;

  const { intro, title, delay } = task;
  tl(`执行任务: `, title, intro, delay);

  const goBtn = task.btn;

  floatyDebug(goBtn);

  if (!checkInScreen(goBtn)) {
    scrollIn(goBtn);
    return;
  }

  floatyDebug(goBtn);

  boundsClick(goBtn);

  sleep(pre);
  scrollPage();
  sleep(delay);

  delayCheck(
    delay + after * (index - 1),
    500,
    () => {
      return !!$('点击返回');
    },
    () => {
      scrollPage();
    },
  );
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
