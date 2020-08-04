import { boundsClick } from '../../../common/click-ele-bounds';
import { delayCheck } from '../../../common/delay-check';
import { collection2array } from '../../../common/floaty-children';
import { killApp } from '../../../common/kill-app';
import { loopRunTask } from '../../../common/loop-run-task';
import { openTaoBaoMain, taobaoId } from '../../../common/open-app';
import { retryRun } from '../../../common/retry-run';
import { tl } from '../../../common/toast';

function goToPage() {
  tl('尝试进入 [瓜分10亿] 页面');

  const pageBtn = delayCheck(
    10000,
    1000,
    () => {
      tl('搜索按钮 [瓜分10亿]');
      return textContains('瓜分10亿').findOnce();
    },
    () => {
      tl('搜索按钮 [首页]');
      const ele =
        id('android:id/tabs').findOnce() ||
        id('com.taobao.taobao:id/iv_btn_background')
          .findOnce()
          ?.parent()
          .parent()
          .parent() ||
        descContains('首页')
          .findOnce()
          ?.parent();

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

  tl('点击 [瓜分10亿]');
  boundsClick(pageBtn);

  tl('等待进入 [瓜分10亿]');
  sleep(3000);
}

function checkIsInTask() {
  return !!textContains('邀请好友一起玩').findOnce();
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
  tl('签到');
  boundsClick(textStartsWith('签到').findOnce());
}

function popup() {
  const ele = text('确认').findOnce();

  if (ele) {
    boundsClick(ele);
    sleep(2000);
  }

  boundsClick(textContains('收下').findOnce());
}

function doTasks() {
  openTask();

  signIn();

  collection2array(textMatches(/.*浏览\d+秒.*得\d+喵币.*/).find()).forEach((ele, index) => {
    const parent = ele.parent();

    if (parent.findOne(textMatches(/去(完成|浏览)/))) {
      loopRunTask({
        ele: parent,
        getEle: () => {
          const list = collection2array(textMatches(/.*浏览\d+秒.*得\d+喵币.*/).find());
          const item = list[index];
          return item.parent();
        },
        name: ele.text(),
        checkIsInTask,
        getBtn: (o) => {
          return o.findOne(textMatches(/去(完成|浏览)/));
        },
        afterBack: () => {
          sleep(1000);
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

      tl('打开淘宝中');
      const isOpenSuccess = openTaoBaoMain();
      if (!isOpenSuccess) {
        throw new Error('open taoBao failed');
      }
      goToPage();

      popup();

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
