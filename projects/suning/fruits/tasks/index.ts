import { delayCheck } from '../../../common/delay-check';
import { killApp } from '../../../common/kill-app';
import { openSuning } from '../../../common/open-app';
import { retryRun } from '../../../common/retry-run';
import { addAnimals, collectAnimal } from './animal';
import { collectCoin } from './coin';
import { goShop } from './go-shop';
import { steal } from './steal';
import { weed } from './weed';

const suningApplicationId = 'com.suning.mobile.ebuy';

function runWithRetry(retries = 3) {
  retryRun(
    () => {
      openSuning('https://c.m.suning.com/newFarm.html#/', 3000);

      const isOpenSuccess = delayCheck(15000, 1000, () => {
        return textContains('ico-lingjingbi').findOnce();
      });

      if (!isOpenSuccess) {
        throw new Error('open suning page failed');
      }

      toastLog('收集宠物');
      collectAnimal();

      toastLog('饲养宠物');
      addAnimals();

      toastLog('做任务');
      goShop();

      toastLog('除草');
      weed();

      toastLog('领取任务金币');
      collectCoin();

      toastLog('偷金币');
      steal();
    },
    () => {
      sleep(500);
      killApp(suningApplicationId);
    },
    '苏宁',
    retries
  );
}

export { runWithRetry };
