import { floatyDebug } from './floaty-debug';
import { tl } from './toast';
import { checkInScreen } from './in-screen';

type ChildrenFilter =
  | ((ele: UiObject) => any)
  | 'id'
  | 'text'
  | 'id-text'
  | 'text-id'
  | 'visual'
  | 'visual-id'
  | 'visual-text'
  | undefined
  | 'visual-id-text'
  | 'visual-text-id'
  | null
  | true;

function collection2array(collection?: UiCollection) {
  if (!collection) {
    return [];
  }

  const arr: UiObject[] = [];
  collection.forEach((o) => {
    arr.push(o);
  });

  return arr;
}

function filterChildren(parent: UiObject, fn: (o: UiObject) => boolean) {
  const parents: UiObject[] = [parent];
  const list: UiObject[] = [];

  while (parents.length) {
    const next = parents.pop();

    if (next === undefined) {
      break;
    }

    list.push(next);

    if (next.childCount() > 0) {
      const children = collection2array(next.children());
      parents.push(...children);
    }
  }

  return list.filter(fn);
}

function convertFilter(filterType: ChildrenFilter) {
  switch (filterType) {
    case null:
    case true:
      return () => {
        return true;
      };
    case 'text':
      return (ele: UiObject) => {
        const text = ele.text();
        return !!text;
      };
    case 'id':
      return (ele: UiObject) => {
        const val = ele.id();
        return !!val;
      };
    case 'id-text':
      return (ele: UiObject) => {
        const val = ele.id() || ele.text();
        return !!val;
      };
    case 'text-id':
      return (ele: UiObject) => {
        const val = ele.text() || ele.id();
        return !!val;
      };
    case 'visual':
      return (ele: UiObject) => {
        return checkInScreen(ele);
      };
    case 'visual-text':
      return (ele: UiObject) => {
        if (!checkInScreen(ele)) {
          return false;
        }
        const text = ele.text();
        return !!text;
      };
    case 'visual-id':
      return (ele: UiObject) => {
        if (!checkInScreen(ele)) {
          return false;
        }
        const val = ele.id();
        return !!val;
      };
    case undefined:
    case 'visual-id-text':
      return (ele: UiObject) => {
        if (!checkInScreen(ele)) {
          return false;
        }
        const val = ele.id() || ele.text();
        return !!val;
      };
    case 'visual-text-id':
      return (ele: UiObject) => {
        if (!checkInScreen(ele)) {
          return false;
        }
        const val = ele.text() || ele.id();
        return !!val;
      };
    default:
      return filterType;
  }
}

function floatyChildren(parent?: UiObject | null, filter?: ChildrenFilter, timeout = 1000) {
  if (!parent) {
    tl('没有父元素...');
    return;
  }

  const children = filterChildren(parent, convertFilter(filter));

  floatyDebug(parent);
  tl('子元素有', children.length);

  sleep(2000);

  children.forEach((item, index) => {
    tl(index, item.id() || item.text());

    const text = item.text();
    const id = item.id();

    floatyDebug(
      () => {
        if (text) {
          setClip(text);
          tl(`复制text成功 ${text}`);
          return;
        }

        if (id) {
          setClip(id);
          tl(`复制id成功 ${id}`);
        }
      },
      timeout,
      item
    );

    sleep(timeout);
  });

  tl('floatyChildren 结束');
}

export { floatyChildren, collection2array };
