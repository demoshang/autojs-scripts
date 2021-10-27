import { boundsClick } from '../../../common/click-ele-bounds';
import { findAndClick } from '../../../common/find-click';
import { getChild, getChildren } from '../../../common/floaty-children';
import { getUiObject } from '../../../common/ui-object';

function doSumTask() {
  const btns = getChildren(
    getChild(getUiObject('当前进度')?.parent(), 2),
    [1, 2, 3],
  );

  btns.forEach((ele) => {
    boundsClick(ele);

    sleep(1000);

    findAndClick({
      image: images.read('./assets/jd211111/close.png'),
      options: { threshold: 0.2 },
    });

    sleep(1000);
  });
}

export { doSumTask };
