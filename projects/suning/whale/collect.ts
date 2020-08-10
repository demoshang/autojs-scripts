import { boundsClick } from '../../common/click-ele-bounds';
import { tl } from '../../common/toast';
import { openWhale } from './open';

function collect(): void {
  if (!textContains('每天9点开启').findOnce()) {
    openWhale();

    if (!textContains('每天9点开启').findOnce()) {
      throw new Error('不在界面1');
    }
  }

  const ele = textMatches(/^\d+\/\d+$/).findOnce();
  if (!ele) {
    throw new Error('不在界面2');
  }

  const bounds = ele.bounds();

  const o = {
    x: bounds.centerX(),
    y: bounds.centerY() - bounds.height() * 2,
  };

  boundsClick(o);

  const matches = ele.text().match(/^(\d+)\/(\d+)/);

  if (!matches) {
    throw new Error('不在界面3');
  }

  const rest = parseInt(matches[0], 10);

  tl(rest);

  if (rest > 200) {
    // throw new Error('长时间收集失败');
  }
}

export { collect };
