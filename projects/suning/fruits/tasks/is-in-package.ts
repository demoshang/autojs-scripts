import { suningApplicationId } from '../../../common/app/old-open-app';

function throwWhenNotInPackage(): boolean {
  return currentPackage() === suningApplicationId;
}

export { throwWhenNotInPackage };
