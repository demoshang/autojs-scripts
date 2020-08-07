import { delayCheck } from './delay-check';

const jdApplicationId = 'com.jingdong.app.mall';
const suningApplicationId = 'com.suning.mobile.ebuy';
const taobaoId = 'com.taobao.taobao';

function openPage(url: string, sleepTime = 0): void {
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

function openSuning(page: string, sleepTime?: number): void {
  const url = `suning://m.suning.com/index?adTypeCode=1002&adId=${page}`;
  openPage(url, sleepTime);
}

function openJDMain(timeout = 10000, delay = 500): boolean {
  app.startActivity({
    action: 'android.intent.action.VIEW',
    packageName: jdApplicationId,
    className: 'com.jingdong.app.mall.main.MainActivity',
  });

  return !!delayCheck(timeout, delay, () => {
    return currentPackage() === jdApplicationId && desc('我的').findOnce();
  });
}

function openTaoBaoMain(timeout = 10000, delay = 500): boolean {
  app.startActivity({
    action: 'android.intent.action.VIEW',
    packageName: taobaoId,
    className: 'com.taobao.tao.TBMainActivity',
  });

  return !!delayCheck(timeout, delay, () => {
    return (
      currentPackage() === taobaoId &&
      (textContains('天猫超市').findOnce() ||
        textContains('天猫新品').findOnce() ||
        descContains('首页').findOnce())
    );
  });
}

export {
  suningApplicationId,
  jdApplicationId,
  taobaoId,
  openPage,
  openSuning,
  openJDMain,
  openTaoBaoMain,
};
