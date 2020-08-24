import { delayCheck } from '../../../common/delay-check';
import { getTaskDelay } from '../../../common/get-task-count';
import { checkInScreen } from '../../../common/in-screen';
import { scrollIn } from '../../../common/scroll';
import { tl } from '../../../common/toast';
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

function runTask(
  taskPrefix: string | RegExp | UiObject | null | undefined,
  taskName = taskPrefix?.toString()
) {
  if (!isInTask()) {
    throw new Error('不在任务界面');
  }

  let uiObj = getUiObject(taskPrefix)?.parent();
  if (!checkInScreen(uiObj)) {
    scrollIn(uiObj);
    uiObj = getUiObject(taskPrefix)?.parent();
  }

  const delay = getTaskDelay(uiObj, taskName, 15000);

  if (!uiObj) {
    throw new Error(`未找到任务详情: ${taskPrefix}`);
  }

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
    sleep(delay);
    back();
  }

  sleep(1000);
}

function goShop(): void {
  tl('开始');

  const isOpenSuccess = delayCheck(15000, 1000, isInTask);
  if (!isOpenSuccess) {
    throw new Error('open suning page failed');
  }

  runTask('视频');
  runTask('会场');
  runTask('逛苏宁金融频道');

  pressClose();
}

export { goShop };
