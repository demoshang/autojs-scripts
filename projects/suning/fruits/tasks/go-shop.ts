import { delayCheck } from '../../../common/delay-check';
import { getTaskCount } from '../../../common/get-task-count';
import { checkInScreen } from '../../../common/in-screen';
import { myScroll } from '../../../common/scroll';
import { getUiObject } from '../../../common/ui-object';
import { pressClose } from './press-close';

function isInTask() {
  const reg = /.*\d+金币/;

  if (textMatches(reg).findOnce()) {
    return true;
  }

  const ele = textContains('ico-lingjingbi').findOnce();
  if (!ele) {
    return false;
  }

  ele.click();
  sleep(3000);
  return !!textMatches(reg).findOnce();
}

function doTask(uiObj?: UiObject) {
  const goBtn = uiObj?.findOne(textContains('去完成'));
  const finishBtn = uiObj?.findOne(textContains('已完成'));
  if (!goBtn) {
    if (finishBtn) {
      return;
    }

    throw new Error('未找到任务按钮');
  }

  goBtn.click();
  // 等待页面渲染
  sleep(4000);

  // 苏宁无法处理
  if (textContains('来晚啦').findOnce()) {
    back();
  } else {
    // 等待倒计时完成
    sleep(17000);
    back();
  }

  sleep(1000);
}

function runTask(
  taskPrefix: string | RegExp | UiObject | null,
  lastResult?: {
    total: number;
    completed: number;
    left: number;
    retries: number;
    max: number;
  }
) {
  if (!isInTask()) {
    throw new Error('不在任务界面');
  }

  const uiObj = getUiObject(taskPrefix);

  if (!uiObj) {
    throw new Error(`未找到任务详情: ${taskPrefix}`);
  }

  const taskDetailEle = uiObj.findOne(textContains('/'));
  if (!taskDetailEle) {
    throw new Error(`未找到任务详情: ${taskPrefix}`);
  }
  const taskName = taskDetailEle.text();
  const taskCount = getTaskCount(taskName);
  toastLog(
    `任务: ${taskName}
    taskCount:  ${JSON.stringify(taskCount)}
    lastResult: ${JSON.stringify(lastResult)}`
  );

  if (taskCount.left === 0) {
    return;
  }

  if (lastResult && lastResult.left === taskCount.left) {
    if (lastResult.retries > lastResult.max) {
      toastLog(`⚠️警告: ${taskName} 任务失败`);
      return;
    }
  }

  doTask(uiObj.parent());

  runTask(taskPrefix, {
    ...taskCount,
    retries: ((lastResult && lastResult.retries) || 0) + 1,
    max: (lastResult && lastResult.max) || taskCount.left + 1,
  });
}

function goShop() {
  toastLog('开始');

  const isOpenSuccess = delayCheck(15000, 1000, isInTask);
  if (!isOpenSuccess) {
    throw new Error('open suning page failed');
  }

  const shopEle = getUiObject(/(.*(店铺|店)\(\d+\/\d+\).*)|(逛.*\(\d+\/\d+\).*)/);
  runTask(shopEle);

  const videoEle = getUiObject('视频(');
  runTask(videoEle);

  const meetingEle = getUiObject(/(.*会场\(.*)|(.*工厂\(.*)/);
  runTask(meetingEle);

  const anchorEle = getUiObject('点赞主播');

  const list = [shopEle, videoEle, meetingEle, anchorEle, anchorEle, anchorEle];

  let ele;
  while (list.length) {
    ele = getUiObject('逛苏宁金融频道')?.parent();
    if (checkInScreen(ele)) {
      break;
    }

    myScroll(list.shift()?.parent(), 1000);
  }

  doTask(ele);

  pressClose();
}

export { goShop };
