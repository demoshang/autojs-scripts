// 互动种草

import { boundsClick } from '../../../common/click-ele-bounds';
import { getTaskCount } from '../../../common/get-task-count';
import { scrollIn, scrollPage } from '../../../common/scroll';
import { tl } from '../../../common/toast';
import { getUiObject } from '../../../common/ui-object';

const MATCH_REG = /互动种草/;

function checkIsZhongCao() {
  return !!getUiObject(MATCH_REG);
}

function doZhongCao() {
  let index = 0;

  while (true) {
    index += 1;

    const text = getUiObject(/\(\d+\/\d+\)/)?.text();
    const task = getTaskCount(text);

    if (!task) {
      throw new Error('任务数量未找到');
    }

    if (task.left <= 0) {
      break;
    }

    let ele = getUiObject(/自营|旗舰/);
    scrollIn(ele);
    ele = getUiObject(/自营|旗舰/);

    boundsClick(ele);
    scrollPage();
    sleep(1000);
    back();
    sleep(3000);

    if (index >= task.total * 2) {
      break;
    }
  }
}

export { checkIsZhongCao, doZhongCao };
