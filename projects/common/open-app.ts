import { boundsClick } from './click-ele-bounds';
import { delayCheck } from './delay-check';
import { getUiObject } from './ui-object';

const jdApplicationId = 'com.jingdong.app.mall';
const suningApplicationId = 'com.suning.mobile.ebuy';
const taobaoId = 'com.taobao.taobao';
const jdJinRongId = 'com.jd.jrapp';

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
    if (currentPackage() !== jdApplicationId) {
      return false;
    }

    // 是否存在广告
    const jumpBtn = getUiObject('跳过');

    if (jumpBtn) {
      boundsClick(jumpBtn);
      return false;
    }

    return desc('我的').findOnce();
  });
}

function openJDJR(timeout = 10000, delay = 500): boolean {
  app.startActivity({
    action: 'android.intent.action.VIEW',
    packageName: jdJinRongId,
    className: 'com.jd.jrapp.bm.mainbox.main.MainActivity',
  });

  return !!delayCheck(timeout, delay, () => {
    if (currentPackage() !== jdJinRongId) {
      return false;
    }

    // 是否存在广告
    const jumpBtn = getUiObject('跳过');
    if (jumpBtn) {
      boundsClick(jumpBtn);
      return false;
    }

    return idContains('iv_fifth_icon').findOnce();
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
  jdJinRongId,
  taobaoId,
  openPage,
  openSuning,
  openJDMain,
  openJDJR,
  openTaoBaoMain,
};
