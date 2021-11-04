import { jumpTop } from '../../common/jump-top';
import { killApp } from '../../common/kill-app';
import { suningApplicationId } from '../../common/app/old-open-app';
import { retryRun } from '../../common/retry-run';
import { collect } from './collect';
import { doExclusive } from './exclusive-reward';
import { openWhale } from './open';
import { doShop } from './shop';
import { signIn } from './sign-in';
import { doTask } from './task';
import { openTaskPanel } from './task-panel';

function runWithRetry(retries = 3): void {
  retryRun(
    () => {
      openWhale();

      doExclusive();

      collect();

      doShop();

      jumpTop();
      openTaskPanel();
      signIn();
      doTask();
    },
    () => {
      sleep(1000);
      killApp(suningApplicationId);
    },
    '苏宁',
    retries,
  );
}

function runCollect() {
  retryRun(
    () => {
      collect();
    },
    () => {
      sleep(1000);
      killApp(suningApplicationId);
    },
    '苏宁',
    3,
  );
}

function loopCollect(): void {
  runCollect();

  setInterval(() => {
    runCollect();
  }, 60 * 1000);
}

export { runWithRetry, loopCollect };
