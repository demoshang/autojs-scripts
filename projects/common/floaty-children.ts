import { floatyDebug } from './floaty-debug';

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

function floatyChildren(
  parent?: UiObject | null,
  timeout = 5000,
  filter: (ele: UiObject) => any = (o) => {
    const text = o.text();
    const id = o.id();

    return !!(text || id);
  }
) {
  if (!parent) {
    return;
  }

  const arr = filterChildren(parent, filter);

  floatyDebug(
    (ele) => {
      const text = ele.text();
      if (text) {
        setClip(text);
        toastLog(`复制text成功 ${text}`);
        return;
      }

      const id = ele.id();
      if (id) {
        setClip(id);
        toastLog(`复制id成功 ${id}`);
      }
    },
    timeout,
    ...arr
  );

  sleep(timeout);
}

export { floatyChildren, collection2array };
