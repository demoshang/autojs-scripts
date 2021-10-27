import { floatyDebug } from './floaty-debug';
import { checkInScreen } from './in-screen';
import { tl, toastUiObject } from './toast';

type ChildrenFilter =
  | ((ele: UiObject) => any)
  | 'id'
  | 'text'
  | 'id-text'
  | 'text-id'
  | 'id-text-desc'
  | 'desc'
  | 'visual'
  | 'visual-id'
  | 'visual-text'
  | 'visual-id-text'
  | 'visual-id-text-desc'
  | 'visual-text-id'
  | 'visual-desc'
  | undefined
  | null
  | boolean;

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
  maxDepth = Number.MAX_SAFE_INTEGER,
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
        }),
      );
    }
  }

  // 删除第一个 parent
  list.shift();

  return list.filter(fn);
}

function convertFilter(filterType: ChildrenFilter): (obj: UiObject) => boolean {
  switch (filterType) {
    case null:
    case true:
      return () => {
        return true;
      };
    case false:
      return () => {
        return false;
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
    case 'desc':
      return (ele: UiObject) => {
        const desc = ele.contentDescription;
        return !!desc;
      };
    case 'id-text':
      return (ele: UiObject) => {
        const val = ele.id() || ele.text();
        return !!val;
      };
    case 'id-text-desc':
      return (ele: UiObject) => {
        const val = ele.id() || ele.text() || ele.contentDescription;
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
    case 'visual-desc':
      return (ele: UiObject) => {
        if (!checkInScreen(ele)) {
          return false;
        }
        const desc = ele.contentDescription;
        return !!desc;
      };
    case 'visual-id-text':
      return (ele: UiObject) => {
        if (!checkInScreen(ele)) {
          return false;
        }
        const val = ele.id() || ele.text();
        return !!val;
      };
    case undefined:
    case 'visual-id-text-desc':
      return (ele: UiObject) => {
        if (!checkInScreen(ele)) {
          return false;
        }
        const val = ele.id() || ele.text() || ele.contentDescription;
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

  const desc = ele.contentDescription;

  if (text) {
    setClip(text);
    tl(`复制text成功 ${text}`);
    return;
  }

  if (id) {
    setClip(id);
    tl(`复制id成功 ${id}`);
  }

  if (desc) {
    setClip(desc);
    tl(`复制desc成功 ${desc}`);
  }
}

interface FloatConfig {
  concurrence?: boolean;
  filter?: ChildrenFilter;
  timeout?: number;
  depth?: number;
}

function floatyChildren(parent?: UiObject | null, filter?: boolean): void;
function floatyChildren(parent?: UiObject | null, config?: FloatConfig): void;
function floatyChildren(
  parent?: UiObject | null,
  config?: FloatConfig | boolean,
): void {
  if (!parent) {
    tl('没有父元素...');
    return;
  }

  let {
    filter,
    concurrence,
    timeout = 1000,
    depth,
  }: FloatConfig = {
    ...(typeof config === 'boolean' ? { filter: config } : config),
  };

  const children = filterChildren(parent, convertFilter(filter), depth);

  floatyDebug(parent);
  tl('子元素有', children.length);

  sleep(1000);

  if (concurrence) {
    floatyDebug(
      (item, index) => {
        floatyCopy(item);
        toastUiObject(item, { index });
      },
      timeout,
      ...children,
    );
    sleep(timeout);
  } else {
    children.forEach((item, index) => {
      toastUiObject(item, { index });

      floatyDebug(floatyCopy, timeout, item);

      sleep(timeout);
    });
  }

  tl('floatyChildren 结束');
}

function getChild(parent?: UiObject, index = 0) {
  return collection2array(parent?.children())[index];
}

export { floatyChildren, filterChildren, collection2array, getChild };
