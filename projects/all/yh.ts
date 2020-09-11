import { boundsClick } from '../common/click-ele-bounds';
import { smlMove } from '../common/swipe';
import { tl } from '../common/toast';

function capture(ele: UiObject) {
  const rect = ele.bounds();
  boundsClick(rect);
  sleep(5000);

  const move = {
    from: {
      x: rect.left,
      y: rect.top + rect.height() / 2,
    },
    to: {
      x: rect.right,
      y: rect.top + rect.height() / 2,
    },
  };
  tl(move);
  smlMove(move);

  sleep(1000);
}

function start(): void {
  tl('请手动打开浏览器, 并刷新页面');
  app.startActivity('console');
  sleep(3000);

  setInterval(() => {
    tl('开始寻找 智能验证 按钮');
    const ele = textContains('点击按钮开始智能验证').findOnce()?.parent();
    if (!ele) {
      tl('没有找到 智能验证 按钮');
      return;
    }

    capture(ele);
  }, 5000);
}

export { start };
