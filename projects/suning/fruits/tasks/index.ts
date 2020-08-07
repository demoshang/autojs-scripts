import { delayCheck } from '../../../common/delay-check';
import { killApp } from '../../../common/kill-app';
import { openSuning, suningApplicationId } from '../../../common/open-app';
import { retryRun } from '../../../common/retry-run';
import { tl } from '../../../common/toast';
import { addAnimals, collectAnimal } from './animal';
import { collectCoin } from './coin';
import { goShop } from './go-shop';
import { throwWhenNotInPackage } from './is-in-package';
import { pressClose } from './press-close';
import { steal } from './steal';

function runWithRetry(retries = 3): void {
  retryRun(
    () => {
      openSuning('https://c.m.suning.com/newFarm.html#/', 3000);

      const isOpenSuccess = delayCheck(15000, 1000, () => {
        return textContains('ico-lingjingbi').findOnce();
      });

      if (!isOpenSuccess) {
        throw new Error('open suning page failed');
      }

      pressClose();

      tl('收集宠物');
      collectAnimal();

      throwWhenNotInPackage();

      tl('饲养宠物');
      addAnimals();

      throwWhenNotInPackage();

      tl('做任务');
      goShop();

      throwWhenNotInPackage();

      tl('领取任务金币');
      collectCoin();

      throwWhenNotInPackage();

      tl('偷金币');
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
