import { collection2array } from '../../common/floaty-children';

function checkIsInTaskPanel() {
  return !!textContains('连续签到得鲸币').findOnce();
}

function throwIfNotInTask() {
  if (!checkIsInTaskPanel()) {
    throw new Error('任务面板打开失败');
  }
}

function openTaskPanel() {
  if (checkIsInTaskPanel()) {
    return;
  }

  const parent = textContains('每天9点开启').findOnce()?.parent().parent();

  collection2array(parent?.children())[7]?.click();

  sleep(1000);
  throwIfNotInTask();
}

function closeTaskPanel() {
  if (checkIsInTaskPanel()) {
    textContains('去完成')
      .findOnce()
      ?.parent()
      .parent()
      .parent()
      .children()
      .get(0)
      .click();
  }
}

function reopenTaskPanel() {
  closeTaskPanel();
  sleep(1000);
  openTaskPanel();
}

export {
  openTaskPanel,
  closeTaskPanel,
  reopenTaskPanel,
  checkIsInTaskPanel,
  throwIfNotInTask,
};
