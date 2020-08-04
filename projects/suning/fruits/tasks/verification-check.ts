import { getUiObject } from '../../../common/ui-object';

function checkVerification() {
  return !!getUiObject('请完成下方拼图验证');
}

function throwVerification() {
  if (checkVerification()) {
    throw new Error('拼图验证');
  }
}

export { checkVerification, throwVerification };
