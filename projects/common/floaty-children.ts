import { floatyDebug } from './floaty-debug';
import { checkInScreen } from './in-screen';
import { tl } from './toast';

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

function collection2array(collection?: UiCollection): UiObject[] {
  if (!collection) {
    return [];
  }

  const arr: UiObject[] = [];
  collection.forEach((o) => {
    arr.push(o);
  });

  return arr;
}

function filterChildren(
  parent: UiObject,
  fn: (o: UiObject) => boolean,
  maxDepth = Number.MAX_SAFE_INTEGER
) {
  const parents: { item: UiObject; depth: number }[] = [
    {
      item: parent,
      depth: 0,
    },
  ];
  const list: UiObject[] = [];

  while (parents.length) {
    const next = parents.shift();

    if (next === undefined) {
      break;
    }

    const { item, depth } = next;
    list.push(item);

    if (depth < maxDepth && item.childCount() > 0) {
      const children = collection2array(item.children());
      parents.push(
        ...children.map((o) => {
          return { item: o, depth: depth + 1 };
        })
      );
    }
  }

  // 删除第一个 parent
  list.shift();

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

function floatyCopy(ele: UiObject) {
  const text = ele.text();
  const id = ele.id();

  if (text) {
    setClip(text);
    tl(`复制text成功 ${text}`);
    return;
  }

  if (id) {
    setClip(id);
    tl(`复制id成功 ${id}`);
  }
}

function floatyChildren(
  parent?: UiObject | null,
  {
    filter,
    concurrence = false,
    timeout = 1000,
    depth,
  }: {
    concurrence?: boolean;
    filter?: ChildrenFilter;
    timeout?: number;
    depth?: number;
  } = {}
): void {
  if (!parent) {
    tl('没有父元素...');
    return;
  }

  const children = filterChildren(parent, convertFilter(filter), depth);

  floatyDebug(parent);
  tl('子元素有', children.length);

  sleep(1000);

  if (concurrence) {
    floatyDebug(
      (item, index) => {
        floatyCopy(item);
        tl(index, { id: item.id(), text: item.text() });
      },
      timeout,
      ...children
    );
    sleep(timeout);
  } else {
    children.forEach((item, index) => {
      tl(index, { id: item.id(), text: item.text() });

      floatyDebug(floatyCopy, timeout, item);

      sleep(timeout);
    });
  }

  tl('floatyChildren 结束');
}

export { floatyChildren, collection2array };
