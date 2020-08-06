import { jumpTop } from '../../common/jump-top';
import { killApp } from '../../common/kill-app';
import { suningApplicationId } from '../../common/open-app';
import { retryRun } from '../../common/retry-run';
import { openWhale } from './open';
import { doShop } from './shop';
import { signIn } from './sign-in';
import { doTask } from './task';
import { openTaskPanel } from './task-panel';

function runWithRetry(retries = 3) {
  retryRun(
    () => {
      openWhale();

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
    retries
  );
}

export { runWithRetry };
