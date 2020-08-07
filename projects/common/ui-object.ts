import { isRegExp, isUiObject } from './type-check';

function getUiObject(
  taskPrefix?: string | RegExp | UiObject | null
): UiObject | null {
  let uiObj;
  if (typeof taskPrefix === 'string') {
    uiObj = textContains(taskPrefix).findOnce();
  } else if (isRegExp(taskPrefix)) {
    uiObj = textMatches(taskPrefix).findOnce();
  } else if (isUiObject(taskPrefix)) {
    uiObj = taskPrefix;
  } else {
    uiObj = null;
  }

  return uiObj;
}

export { getUiObject };
