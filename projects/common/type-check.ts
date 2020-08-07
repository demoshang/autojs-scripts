import { Bounds, RectWithWH, Radius } from './interface';

enum Type {
  'null' = 'null',
  'undefined' = 'undefined',
  'number' = 'number',
  'boolean' = 'boolean',
  'string' = 'string',
  'array' = 'array',
  'object' = 'object',
  'function' = 'function',
  'regexp' = 'regexp',
}

function detectType(obj: any): string;
function detectType(obj: any, type: Type): boolean;
function detectType(obj: any, type?: Type): string | boolean {
  const name = {}.toString
    .call(obj)
    .split(/[\s\]]/)[1]
    .toLowerCase();

  if (type) {
    return name === type;
  }

  return name;
}

function isNumber(obj: any): boolean {
  return detectType(obj, Type.number);
}

function isRegExp(obj: any): obj is RegExp {
  return detectType(obj, Type.regexp);
}

function isRect(obj: any): obj is Rect {
  if (obj && obj.top && obj.left) {
    return true;
  }

  return false;
}

function isUiObject(obj: any): obj is UiObject {
  if (obj && obj.findOne && obj.click) {
    return true;
  }

  return false;
}

function isBounds(obj: any): obj is Bounds {
  if (obj && isRect(obj.bounds)) {
    return true;
  }

  return false;
}

function isRectWithWH(obj: any): obj is RectWithWH {
  if (obj && isNumber(obj.w) && isNumber(obj.h)) {
    return true;
  }

  return false;
}

function isRadius(obj: any): obj is Radius {
  if (obj && isNumber(obj.x) && isNumber(obj.y)) {
    return true;
  }

  return false;
}

export {
  detectType,
  isNumber,
  isRegExp,
  isRect,
  isUiObject,
  isBounds,
  isRectWithWH,
  isRadius,
};
