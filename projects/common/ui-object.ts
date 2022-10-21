import { collection2array } from './floaty-children';
import { isRegExp, isUiObject } from './type-check';

type TaskPrefix = string | RegExp | UiObject | null;

type SelectorType = 'text' | 'desc' | 'id' | 'className';

function getTextUiObject(taskPrefix?: Exclude<TaskPrefix, UiObject>) {
  let uiObj;
  if (typeof taskPrefix === 'string') {
    uiObj = textContains(taskPrefix).findOnce();
  } else if (isRegExp(taskPrefix)) {
    const source = taskPrefix.source;

    // textMatches 必须要全部匹配, 即开头和结束最好加上 .* 匹配
    if (
      source.indexOf('.*') === 0 ||
      source.indexOf('^') === 0 ||
      source.indexOf('$') === source.length - 1
    ) {
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

function simpleUiObject(ele?: UiObject | null) {
  if (!ele) {
    return undefined;
  }

  return {
    id: ele.id(),
    text: ele.text(),
    desc: ele.contentDescription,
    className: ele.className(),
  };
}

function buildSelectorStep2(
  selector: string | RegExp,
  inputType: SelectorType | SelectorType[],
): UiSelector[] {
  let types: SelectorType[];

  if (Array.isArray(inputType)) {
    types = inputType;
  } else {
    types = [inputType];
  }

  const selectorIsString = typeof selector === 'string';
  let selectorReg: RegExp;

  if (!selectorIsString) {
    const source = selector.source;

    if (
      source.indexOf('.*') === 0 ||
      source.indexOf('^') === 0 ||
      source.indexOf('$') === source.length - 1
    ) {
      selectorReg = selector;
    } else {
      selectorReg = new RegExp(`.*(${source}).*`, selector.flags);
    }
  }

  return types.map((type) => {
    switch (type) {
      case 'id':
        return selectorIsString ? idContains(selector) : idMatches(selectorReg);
      case 'className':
        return selectorIsString
          ? classNameContains(selector)
          : classNameMatches(selectorReg);
      case 'desc':
        return selectorIsString
          ? descContains(selector)
          : descMatches(selectorReg);
      case 'text':
      default:
        return selectorIsString
          ? textContains(selector)
          : textMatches(selectorReg);
    }
  });
}

function buildSelectorStep1(
  selector: string | RegExp,
  inputType?: SelectorType | SelectorType[],
) {
  if (inputType) {
    return buildSelectorStep2(selector, inputType);
  }

  if (typeof selector === 'string') {
    if (selector.startsWith('#')) {
      return buildSelectorStep2(selector.slice(1), 'id');
    } else if (selector.startsWith('.')) {
      return buildSelectorStep2(selector.slice(1), 'className');
    } else if (/\[(.*)\]/.test(selector)) {
      const descName = RegExp.$1;
      return buildSelectorStep2(descName, 'desc');
    } else {
      return buildSelectorStep2(selector, 'text');
    }
  }

  return buildSelectorStep2(selector, inputType ?? ['text', 'desc']);
}

function buildSelector(
  selector: string | RegExp,
  inputType?: SelectorType | SelectorType[],
): [UiSelector[], undefined];
function buildSelector(
  parent: UiObject | null | undefined,
  selector: string | RegExp,
  inputType?: SelectorType | SelectorType[],
): [UiSelector[], UiObject] | null | undefined;
function buildSelector(
  ...args: any[]
): [UiSelector[], undefined] | [UiSelector[], UiObject] | null | undefined {
  if (!args[0] || isUiObject(args[0])) {
    if (!args[0]) {
      return;
    }

    const selector = buildSelectorStep1(args[1], args[2]);
    return [selector, args[0]];
  }

  return [buildSelectorStep1(args[0], args[1]), undefined];
}

function $(
  selector: string | RegExp,
  forceType?: SelectorType | SelectorType[],
): UiObject | null;
function $(
  parent: UiObject | null | undefined,
  selector: string | RegExp,
  forceType?: SelectorType | SelectorType[],
): UiObject | null;
function $(a1: any, a2?: any, a3?: any) {
  const result = buildSelector(a1, a2, a3);
  if (!result) {
    return null;
  }

  const [selectorList, parent] = result;

  for (const uiSelector of selectorList) {
    let ele: UiObject | null;
    if (parent) {
      ele = parent.findOne(uiSelector);
    } else {
      ele = uiSelector.findOnce();
    }

    if (ele) {
      return ele;
    }
  }

  return null;
}

function $$(
  selector: string | RegExp,
  forceType?: SelectorType | SelectorType[],
): UiObject[];
function $$(
  parent: UiObject | null | undefined,
  selector: string | RegExp,
  forceType?: SelectorType | SelectorType[],
): UiObject[];
function $$(a1: any, a2: any, a3?: any) {
  const result = buildSelector(a1, a2, a3);
  if (!result) {
    return null;
  }

  const [selectorList, parent] = result;

  for (const uiSelector of selectorList) {
    let list: UiCollection;

    if (parent) {
      return parent.find(uiSelector);
    } else {
      list = uiSelector.find();
    }

    if (list.size() > 0) {
      return collection2array(list);
    }
  }

  return [];
}

function getRelativeObject(ele?: UiObject | null, index = 1) {
  if (!ele) {
    return undefined;
  }
  const react = ele.bounds();
  const x = react.centerX();
  const y = react.centerY();

  const children = collection2array(ele.parent().children());
  const curPos = children.findIndex((item) => {
    const bounds = item.bounds();

    return x === bounds.centerX() && y === bounds.centerY();
  });

  if (curPos === -1) {
    return undefined;
  }

  const pos = curPos + index;

  return children[pos];
}

export {
  $,
  $$,
  getUiObject,
  getTextUiObject,
  getDescUiObject,
  simpleUiObject,
  getRelativeObject,
};
