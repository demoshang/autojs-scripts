import { getUiObject } from '../../../common/ui-object';

function checkVerification(): boolean {
  return !!getUiObject('请完成下方拼图验证');
}

function throwVerification(): void {
  if (checkVerification()) {
    throw new Error('拼图验证');
  }
}

export { checkVerification, throwVerification };
