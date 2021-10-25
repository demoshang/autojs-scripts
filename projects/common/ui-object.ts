import { isRegExp, isUiObject } from './type-check';

type TaskPrefix = string | RegExp | UiObject | null;

function getTextUiObject(taskPrefix?: Exclude<TaskPrefix, UiObject>) {
  let uiObj;
  if (typeof taskPrefix === 'string') {
    uiObj = textContains(taskPrefix).findOnce();
  } else if (isRegExp(taskPrefix)) {
    const source = taskPrefix.source;

    // textMatches 必须要全部匹配, 即开头和结束最好加上 .* 匹配
    if (source.indexOf('.*') === 0) {
      uiObj = textMatches(taskPrefix).findOnce();
    } else {
      uiObj = textMatches(
        new RegExp(`.*(${source}).*`, taskPrefix.flags),
      ).findOnce();
    }
  } else {
    uiObj = null;
  }

  return uiObj;
}

function getDescUiObject(taskPrefix?: Exclude<TaskPrefix, UiObject>) {
  let uiObj;
  if (typeof taskPrefix === 'string') {
    uiObj = descContains(taskPrefix).findOnce();
  } else if (isRegExp(taskPrefix)) {
    const source = taskPrefix.source;

    if (source.indexOf('.*') === 0) {
      uiObj = descMatches(taskPrefix).findOnce();
    } else {
      uiObj = descMatches(
        new RegExp(`.*(${source}).*`, taskPrefix.flags),
      ).findOnce();
    }
  } else {
    uiObj = null;
  }

  return uiObj;
}

/**
 *  获取 UiObject
 * @param taskPrefix 匹配内容
 * @param type default:'text-desc';  td: text=>desc;  dt: desc=>text
 * @returns UiObject
 */
function getUiObject(
  taskPrefix?: TaskPrefix,
  type: 'text' | 'desc' | 'text-desc' | 'td' | 'desc-text' | 'dt' = 'text-desc',
): UiObject | null {
  if (isUiObject(taskPrefix)) {
    return taskPrefix;
  }

  const text = getTextUiObject(taskPrefix);
  const desc = getDescUiObject(taskPrefix);

  switch (type) {
    case 'text':
      return text;
    case 'desc':
      return desc;
    case 'td':
    case 'text-desc':
      return text ?? desc;
    case 'dt':
    case 'desc-text':
      return desc ?? text;
    default:
      return null;
  }
}

export { getUiObject, getTextUiObject, getDescUiObject };
