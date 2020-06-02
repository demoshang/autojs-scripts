import { boundsClick } from '../../../common/click-ele-bounds';
import { delayCheck } from '../../../common/delay-check';
import { collection2array } from '../../../common/floaty-children';
import { killApp } from '../../../common/kill-app';
import { loopRunTask } from '../../../common/loop-run-task';
import { openTaoBaoMain, taobaoId } from '../../../common/open-app';
import { retryRun } from '../../../common/retry-run';

function goToPage() {
  toastLog('尝试进入 [瓜分10亿] 页面');

  const pageBtn = delayCheck(
    10000,
    1000,
    () => {
      toastLog('搜索按钮 [瓜分10亿]');
      return textContains('瓜分10亿').findOnce();
    },
    () => {
      toastLog('搜索按钮 [我的]');
      const ele =
        id('android:id/tabs').findOnce() ||
        id('com.taobao.taobao:id/iv_btn_background')
          .findOnce()
          ?.parent()
          .parent()
          .parent();

      if (!ele) {
        return;
      }

      const btn = collection2array(ele.children()).pop();
      boundsClick(btn);
    }
  );

  if (!pageBtn) {
    throw new Error('[瓜分10亿] 页面未找到');
  }

  toastLog('点击 [瓜分10亿]');
  boundsClick(pageBtn);

  toastLog('等待进入 [瓜分10亿]');
  sleep(3000);
}

function checkIsInTask() {
  return !!textContains('淘宝成就点').findOnce();
}

function throwIfNotInTask() {
  if (!checkIsInTask()) {
    throw new Error('任务面板打开失败');
  }
}

function openTask() {
  if (checkIsInTask()) {
    console.info('在任务面板中');
    return;
  }

  const ele = textContains('领喵币').findOnce();

  if (!ele) {
    throw new Error('no task found');
  }

  boundsClick(ele);

  throwIfNotInTask();
}

function signIn() {
  toastLog('签到');
  boundsClick(textStartsWith('签到').findOnce());
}

function doTasks() {
  openTask();

  signIn();

  collection2array(textMatches(/.*浏览\d+秒.*得\d+喵币.*/).find()).forEach((ele) => {
    const parent = ele.parent();

    if (parent.findOne(textMatches(/去(完成|浏览)/))) {
      loopRunTask({
        ele: parent,
        name: ele.text(),
        checkIsInTask,
        getBtn: (o) => {
          return o.findOne(textMatches(/去(完成|浏览)/));
        },
      });
    }
  });
}

function runWithRetry(retries = 3) {
  retryRun(
    () => {
      app.startActivity('settings');
      sleep(1000);
      back();

      toastLog('打开淘宝中');
      const isOpenSuccess = openTaoBaoMain();
      if (!isOpenSuccess) {
        throw new Error('open taoBao failed');
      }
      goToPage();

      doTasks();

      sleep(2000);
    },
    () => {
      sleep(1000);
      killApp(taobaoId);
    },
    '淘宝',
    retries
  );
}

export { runWithRetry };
