import { boundsClick } from '../../../common/click-ele-bounds';
import { collection2array } from '../../../common/floaty-children';
import { scrollIn } from '../../../common/scroll';
import { toInt } from '../../../common/to-int';
import { tl } from '../../../common/toast';
import { getUiObject } from '../../../common/ui-object';

const ViewProductRegExp = /当前页.*?浏览.*?(\d+)/;

function checkIsViewProduct() {
  return !!getUiObject(ViewProductRegExp);
}

function viewProduct() {
  const txt = getUiObject(ViewProductRegExp)?.text();
  if (!txt) {
    throw new Error('无法找到浏览内容');
  }

  const [, v] = txt.match(ViewProductRegExp) ?? [];
  if (!v) {
    throw new Error('无法匹配浏览个数');
  }

  const nu = toInt(v);
  console.log('浏览商品', { total: v, current: nu });

  let retries = 0;
  while (retries < nu * 2) {
    retries += 1;

    const list = collection2array(textContains('已完成').find());

    if (list.length >= nu) {
      tl('浏览任务已完成');
      break;
    }

    const products = collection2array(textContains('.jpg!').find());
    let ele = products[retries];

    if (!ele) {
      throw new Error('无法找到商品');
    }

    // 将元素滚动到页面中, 并重新获取其位置
    scrollIn(ele);
    ele = collection2array(textContains('.jpg!').find())[retries];
    const cartEle = collection2array(ele?.parent()?.parent()?.children()).pop();

    if (!cartEle) {
      throw new Error('找不到购物车按钮');
    }

    boundsClick(cartEle);
    sleep(1000);
    back();
    sleep(1000);
  }
}

export { viewProduct, checkIsViewProduct };
