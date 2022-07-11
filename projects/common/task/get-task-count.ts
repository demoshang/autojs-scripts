import { $ } from '../ui-object';

export interface TaskCountResult {
  total: number;
  completed: number;
  left: number;

  dataConfusion?: boolean;
}

function getTaskIntro(container: UiObject | null) {
  const intro =
    $(container, /.*\d+(秒|s).*/)?.text() ?? $(container, /可得\d+/)?.text();
  return intro;
}

function getTaskCount(ele?: UiObject | null): TaskCountResult | null;
function getTaskCount(text?: string): TaskCountResult | null;
function getTaskCount(item?: string | UiObject | null): TaskCountResult | null {
  let text = '';
  if (!item) {
    text = '';
  } else if (typeof item === 'string') {
    text = item;
  } else {
    text = item?.findOne(textMatches(/.*\d+\/\d+.*/))?.text() || '';
  }

  console.info('task detail', text);
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

function getTaskDelay(
  item?: string | UiObject,
  taskName?: string | RegExp,
  defaultDelay = 1000,
): number {
  const regex = /(\d+)(秒|s)/;

  let text = '';
  if (!item) {
    text = '';
  } else if (typeof item === 'string') {
    text = item;
  } else {
    text = $(item, regex)?.text() ?? '';
  }

  if (!regex.test(text)) {
    console.warn(`没有时间限制 ${text}  ${taskName?.toString()}`);

    return defaultDelay;
  }

  const seconds = parseInt(`${RegExp.$1}`, 10);

  return seconds * 1000;
}

export { getTaskCount, getTaskIntro, getTaskDelay };
