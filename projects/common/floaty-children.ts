import { floatyDebug } from './floaty-debug';

function collection2array(collection: UiCollection) {
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

function floatyChildren(parent?: UiObject | null, timeout = 5000) {
  if (!parent) {
    return;
  }
  const arr = filterChildren(parent, (o) => {
    const text = o.text();
    const id = o.id();

    return !!(text || id);
  });

  floatyDebug(
    (ele) => {
      const text = ele.text() || ele.id();
      setClip(text);
      toastLog(`复制成功 ${text}`);
    },
    timeout,
    ...arr
  );

  sleep(timeout);
}

export { floatyChildren };
