import { delayCheck } from '../delay-check';
import { AUTO_JS } from './constants';
import { skipAd as defaultSkipAd } from './skip-ad';

function openApp({
  checkIsIn = () => true,

  wait = 10000,
  confirmCheck = 2,
  skipAd = defaultSkipAd,

  packageName,
  ...intent
}: {
  checkIsIn?: () => boolean;
  wait?: number;
  confirmCheck?: number;
  skipAd?: () => boolean;

  packageName: string;
} & Omit<app.IntentOptions, 'packageName'>) {
  app.startActivity({
    action: 'android.intent.action.VIEW',
    packageName,
    ...intent,
  });

  const checkIsMain = () => {
    const cp = currentPackage();
    if (cp !== packageName && cp !== AUTO_JS) {
      return false;
    }

    return checkIsIn();
  };

  let index = 0;
  return delayCheck({
    timeout: wait,
    delay: 500,
    checkFn: () => {
      const isAd = skipAd();

      // 是广告, 就略过
      if (isAd) {
        index = 0;
        return false;
      }

      // 主界面能找到
      if (checkIsMain()) {
        if (index < confirmCheck) {
          index += 1;
          return false;
        }

        return true;
      }

      return false;
    },
  });
}

export { openApp };
