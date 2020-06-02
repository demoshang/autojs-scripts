interface TaskCountResult {
  total: number;
  completed: number;
  left: number;
}

function getTaskCount(ele?: UiObject): TaskCountResult | null;
function getTaskCount(text?: string): TaskCountResult | null;
function getTaskCount(item?: string | UiObject): TaskCountResult | null {
  let text = '';
  if (!item) {
    text = '';
  } else if (typeof item === 'string') {
    text = item;
  } else {
    text = item?.findOne(textMatches(/.*\d+\/\d+.*/))?.text() || '';
  }

  console.info('=======task detail', text);
  if (!/(\d+)\/(\d+)/.test(text)) {
    return null;
  }

  const completed = parseInt(`${RegExp.$1}`, 10);
  const total = parseInt(`${RegExp.$2}`, 10);
  const left = total - completed;

  return {
    total,
    completed,
    left,
  };
}

function getTaskDelay(item?: string | UiObject, taskName?: string | RegExp) {
  let text = '';
  if (!item) {
    text = '';
  } else if (typeof item === 'string') {
    text = item;
  } else {
    text = item?.findOne(textMatches(/.*\d+秒.*/))?.text() || '';
  }

  if (!/(\d+)秒/.test(text)) {
    console.warn(`没有时间限制 ${text}  ${taskName?.toString()}`);

    return 1000;
  }

  const seconds = parseInt(`${RegExp.$1}`, 10);

  return seconds * 1000;
}

export { getTaskCount, getTaskDelay };
