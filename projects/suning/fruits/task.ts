import { delayCheck } from '../../common/delay-check';
import { killApp } from '../../common/kill-app';
import { openSuning } from '../../common/open-app';
import { retryRun } from '../../common/retry-run';
import { addAnimals, collectAnimal } from './sub-tasks/animal';
import { collectCoin } from './sub-tasks/coin';
import { goShop } from './sub-tasks/go-shop';
import { weed } from './sub-tasks/weed';
import { steal } from './sub-tasks/steal';

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

      toastLog('做任务');
      goShop();

      toastLog('除草');
      weed();

      toastLog('领取任务金币');
      collectCoin();

      toastLog('收集宠物');
      collectAnimal();

      toastLog('饲养宠物');
      addAnimals();

      toastLog('偷金币');
      steal();
    },
    () => {
      killApp(suningApplicationId);
    },
    retries
  );
}

export { runWithRetry };
