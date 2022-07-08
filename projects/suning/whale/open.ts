import { delayCheck } from '../../common/delay-check';
import { openSuning } from '../../common/app/old-open-app';
import { tl } from '../../common/toast';

function openWhale(): void {
  app.startActivity('settings');
  sleep(1000);
  back();
  tl('打开苏宁中...');
  openSuning('https://c.m.suning.com/snWhale.html#/', 3000);

  const isSuccess = delayCheck({
    timeout: 15000,
    delay: 1000,
    checkFn: () => {
      return (
        textContains('天天发现鲸').findOnce() &&
        textContains('领奖店铺').findOnce()
      );
    },
  });

  if (!isSuccess) {
    throw new Error('进入苏宁失败');
  }

  sleep(1000);
}

export { openWhale };
