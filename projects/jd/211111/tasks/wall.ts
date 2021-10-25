import { boundsClick } from '../../../common/click-ele-bounds';
import { collection2array } from '../../../common/floaty-children';
import { checkInScreen } from '../../../common/in-screen';
import { scrollPage } from '../../../common/scroll';

function getList() {
  const list = collection2array(textMatches(/.*(jpg|png).*/).find());

  const arr = list.slice(list.length - 5);
  return arr;
}

function checkIsWall(ele = getList()[0]) {
  return checkInScreen(ele);
}

function doWall() {
  const list = getList();

  let ele = list.pop();
  while (ele) {
    if (!checkIsWall(ele)) {
      throw new Error('任务失败, 不在屏幕可点击范围内');
    }

    boundsClick(ele);
    sleep(3000);
    scrollPage();

    for (let i = 0; i < 5; i += 1) {
      back();

      if (checkIsWall(ele)) {
        break;
      }
    }

    sleep(1000);

    ele = list.pop();
  }
}

export { checkIsWall, doWall };
