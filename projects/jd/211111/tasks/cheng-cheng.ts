import { boundsClick } from '../../../common/click-ele-bounds';
import { getChild } from '../../../common/floaty-children';
import { getUiObject } from '../../../common/ui-object';

function checkIsInChengCheng() {
  return !!getUiObject(/邀请新|624393fabf2293cb/);
}

function doChengCheng() {
  boundsClick(getChild(getUiObject('邀请新')?.parent(), 2));

  sleep(1000);

  boundsClick(getUiObject('624393fabf2293cb'));

  sleep(1000);
  back();
}

export { checkIsInChengCheng, doChengCheng };
