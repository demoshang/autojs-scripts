import { delayCheck } from './delay-check';

const jdApplicationId = 'com.jingdong.app.mall';

function openPage(url: string, sleepTime = 0) {
  const i = app.intent({
    action: 'VIEW',
    data: url,
    flags: ['activity_new_task'],
  });
  context.startActivity(i);

  if (sleepTime) {
    sleep(sleepTime);
  }
}

function openSuning(page: string, sleepTime?: number) {
  const url = `suning://m.suning.com/index?adTypeCode=1002&adId=${page}`;
  openPage(url, sleepTime);
}

function openJDMain(timeout = 15000, delay = 1000): boolean {
  app.startActivity({
    action: 'android.intent.action.VIEW',
    packageName: jdApplicationId,
    className: 'com.jingdong.app.mall.main.MainActivity',
  });

  return !!delayCheck(timeout, delay, () => {
    return currentPackage() === jdApplicationId && desc('我的').findOnce();
  });
}

export { jdApplicationId, openPage, openSuning, openJDMain };
