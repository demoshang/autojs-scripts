import { boundsClick } from '@/common/click-ele-bounds';
import { delayCheck } from '@/common/delay-check';
import { getChild } from '@/common/floaty-children';
import { keepInDynamic } from '@/common/in-screen';
import { scrollPage } from '@/common/scroll';
import { Task } from '@/common/task/Task';
import { Worker } from '@/common/task/Worker';
import { tl } from '@/common/toast';
import { $, $$ } from '@/common/ui-object';

function checkIsInActivity() {
  return delayCheck({
    timeout: 10000,
    delay: 800,
    checkFn: () => {
      if ($('领水滴')) {
        return true;
      }

      return false;
    },
  });
}

function openActivityPage() {
  tl('打开饿了么中');

  app.startActivity({ packageName: 'me.ele' });

  return checkIsInActivity();
}

console.log('==================', { openActivityPage });

function keepInTaskPage() {
  const isInTask = delayCheck({
    timeout: 15000,
    delay: 800,
    checkFn: (timeout) => {
      if ($('领水滴') && $('每日任务')) {
        return true;
      }

      if (timeout && timeout < 3000) {
        app.launchApp('me.ele');
      }

      return;
    },
    runFirst: false,
    runFn: () => {
      if ($('领水滴')) {
        boundsClick($('领水滴'));
      } else {
        tl('返回');
        back();
      }
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
  const timeout =
    delay + (/浏览/.test(title) ? 14000 : 0) + after * (index - 1) ** 2;

  tl(`执行任务: `, title, intro || '', '执行时长: ', timeout);

  const goBtn = task.btn;

  const headBounds = $('每日任务')?.parent().bounds();

  if (
    !keepInDynamic(
      () => {
        if (!goBtn || !title) {
          return null;
        }

        return $(title);
      },
      {
        x: headBounds?.left ?? 0,
        y:
          (headBounds?.top ?? 0) +
          (headBounds?.height() ?? 0) +
          (goBtn?.bounds()?.height() ?? 0),
      },
    )
  ) {
    tl('任务超出屏幕, 先滚动...');
    return;
  }

  boundsClick(goBtn);

  sleep(pre);

  if (goBtn?.text() === '领取') {
    return;
  }

  delayCheck({
    timeout,
    delay: 500,
    checkFn: () => {
      if ($('领水滴') && $('每日任务')) {
        return true;
      }

      return !!$('任务完成');
    },
    runFn: () => {
      scrollPage();
    },
    log: 1000,
    runFirst: true,
  });
}

function queryTask() {
  const ele = $('每日任务')?.parent()?.parent();

  const btnReg = /^(去看看|去完成|领取)$/;

  const list = $$(ele, btnReg);

  if (!list?.length) {
    throw new Error('未找到任务');
  }

  return list
    .map((ele) => {
      return ele.parent().parent();
    })
    .map((container) => {
      return new Task({
        container,
        title: getChild(getChild(container, 1), 0)?.text() || '',
        btn: () => {
          return $(container, btnReg);
        },
        taskCount: (container) => {
          let rest = 2;

          if ($(container, btnReg)?.text() === '领取') {
            rest = 1;
          } else if (!$(container, btnReg)) {
            rest = 0;
          }

          return {
            total: 2,
            completed: 2 - rest,
            left: rest,
          };
        },
      });
    });
}

function taskSkip(task: Task) {
  const { title } = task;

  return /实付|邀请|点击3个商品|APP首页|闲鱼|菜鸟|手淘|点淘|UC|飞猪|天猫/.test(
    title,
  );
}

function run(retries: number) {
  console.show();

  const worker = new Worker({
    name: '饿了么-水果',
    runTask,
    keepInTaskPage,
    workerRetires: retries,
    queryTask,
    taskSkip,

    destroy: () => {
      console.hide();
      exit();
    },

    openApp: () => {
      return checkIsInActivity();
    },
    killApp: () => {},
    // openApp: openActivityPage,
    // killApp: () => {
    //   return killApp('me.ele');
    // },
  });

  worker.start();
}

export { run };
