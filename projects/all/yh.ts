import { boundsClick } from '../common/click-ele-bounds';
import { floatyDebug } from '../common/floaty-debug';
import { smlMove } from '../common/swipe';
import { tl } from '../common/toast';

function capture() {
  tl('开始寻找 智能验证 按钮');
  const ele = textContains('点击按钮开始智能验证').findOne()?.parent();
  if (!ele) {
    tl('没有找到 智能验证 按钮');
    return;
  }
  const rect = ele.bounds();
  boundsClick(rect);
  sleep(5000);
  floatyDebug(
    {
      x: rect.left,
      y: rect.top + rect.height() / 2,
    },
    {
      x: rect.right,
      y: rect.top + rect.height() / 2,
    }
  );
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
  capture();
}

function start(): void {
  app.startActivity({
    action: 'android.intent.action.VIEW',
    packageName: 'com.mmbox.xbrowser',
    className: 'com.mmbox.xbrowser.BrowserActivity',
  });

  sleep(1000);

  boundsClick('自动测试');

  capture();
}

export { start };
