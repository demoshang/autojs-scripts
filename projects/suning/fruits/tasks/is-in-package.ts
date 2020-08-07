import { suningApplicationId } from '../../../common/open-app';

function throwWhenNotInPackage(): boolean {
  return currentPackage() === suningApplicationId;
}

export { throwWhenNotInPackage };
