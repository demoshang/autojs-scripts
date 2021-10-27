import { boundsClick } from '../../../common/click-ele-bounds';
import { getChild } from '../../../common/floaty-children';
import { getUiObject } from '../../../common/ui-object';

function checkIsInChengCheng() {
  return !!getUiObject(/邀请新|624393fabf2293cb/);
}

function doChengCheng() {
  boundsClick(getChild(getUiObject('邀请新')?.parent(), 2));

  sleep(3000);

  const close = getChild(getUiObject('京口令')?.parent()?.parent(), 1);
  if (close) {
    boundsClick(close);
    sleep(3000);
  }

  boundsClick(getUiObject('624393fabf2293cb'));

  back();
  sleep(1000);

  boundsClick(getUiObject('624393fabf2293cb'));

  sleep(1000);
  back();
}

export { checkIsInChengCheng, doChengCheng };
