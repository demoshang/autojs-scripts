import { delayCheck } from '../../../common/delay-check';
import { getTaskCount } from '../../../common/get-task-count';
import { openSuning } from '../../../common/open-app';
import { collect } from './collect';

function isInTask() {
  const key = '农庄评价任务';

  if (textContains(key).findOnce()) {
    return true;
  }

  const ele = textContains('ico-lingjingbi').findOnce();
  if (!ele) {
    return false;
  }

  ele.click();
  sleep(3000);
  return !!textContains(key).findOnce();
}

function runTask(taskPrefix: string | RegExp) {
  if (!isInTask()) {
    throw new Error('不在任务界面');
  }

  let uiObj: UiObject | null = null;
  if (typeof taskPrefix === 'string') {
    uiObj = textContains(taskPrefix).findOnce();
  } else {
    uiObj = textMatches(taskPrefix).findOnce();
  }

  if (!uiObj) {
    throw new Error(`未找到任务详情: ${taskPrefix}`);
  }

  const taskDetailEle = uiObj.findOne(textContains('/'));
  if (!taskDetailEle) {
    throw new Error(`未找到任务详情: ${taskPrefix}`);
  }
  const taskName = taskDetailEle.text();
  const taskCount = getTaskCount(taskName);
  toastLog(`${taskPrefix} 任务: ${taskName}${JSON.stringify(taskCount)}`);

  if (taskCount.left === 0) {
    return;
  }

  const goBtn = uiObj.parent().findOne(textContains('去完成'));
  const finishBtn = uiObj.parent().findOne(textContains('已完成'));
  if (!goBtn) {
    if (finishBtn) {
      return;
    }

    throw new Error(`未找到任务按钮: ${taskPrefix}`);
  }

  goBtn.click();
  // 等待页面渲染
  sleep(2000);

  sleep(15000);

  back();
  sleep(1000);

  runTask(taskPrefix);
}

function goShop() {
  toastLog('开始');

  const isOpenSuccess = delayCheck(15000, 1000, isInTask);
  if (!isOpenSuccess) {
    throw new Error('open suning page failed');
  }

  runTask(/.*(店铺|店)\(\d\/\d\).*/);
  runTask('视频(');
  runTask('会场(');

  const image = images.read('./assets/match-template/close.png');
  collect({
    image,
    options: { threshold: 0.5 },
  });

  image.recycle();
}

export { goShop };
