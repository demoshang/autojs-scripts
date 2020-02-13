import { suningApplicationId } from '../../../common/open-app';

function throwWhenNotInPackage() {
  return currentPackage() === suningApplicationId;
}

export { throwWhenNotInPackage };
