import { boundsClick } from '../click-ele-bounds';
import { tl } from '../toast';
import { $ } from '../ui-object';

function skipAd() {
  // 是否存在广告
  const jumpBtn = $('跳过');
  if (jumpBtn) {
    tl('检测到广告, 正在执行跳过');
    boundsClick(jumpBtn);
    return true;
  }

  return false;
}

export { skipAd };
