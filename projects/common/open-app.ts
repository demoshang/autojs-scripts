import { boundsClick } from './click-ele-bounds';
import { delayCheck } from './delay-check';
import { tl } from './toast';
import { getUiObject } from './ui-object';

const autojsId = 'org.autojs.autojs';

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

function skipAd({
  timeout,
  delay,
  mainPageCheck,
  mainCheckTimes = 2,
  adRun = () => {
    // 是否存在广告
    const jumpBtn = getUiObject('跳过');
    if (jumpBtn) {
      tl('检测到广告, 正在执行跳过');
      boundsClick(jumpBtn);
      return true;
    }

    return false;
  },
}: {
  timeout: number;
  delay: number;
  adRun?: () => boolean;
  mainPageCheck: () => boolean | UiObject | null | undefined;
  mainCheckTimes?: number;
}) {
  let index = 0;
  return delayCheck(timeout, delay, () => {
    const isAd = adRun();

    // 是广告, 就略过
    if (isAd) {
      return false;
    }

    const isMainPage = mainPageCheck();

    // 不是主页面, 跳过
    if (!isMainPage) {
      return false;
    }

    // 主页面检查次数未达标
    if (index < mainCheckTimes) {
      index += 1;
      return false;
    }

    return true;
  });
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

  return skipAd({
    timeout,
    delay,
    mainPageCheck: () => {
      if (currentPackage() !== jdApplicationId) {
        return false;
      }

      return desc('我的').findOnce();
    },
  });
}

function openJDJR(timeout = 10000, delay = 500): boolean {
  app.startActivity({
    action: 'android.intent.action.VIEW',
    packageName: jdJinRongId,
    className: 'com.jd.jrapp.bm.mainbox.main.MainActivity',
  });

  return skipAd({
    timeout,
    delay,
    mainPageCheck: () => {
      const cp = currentPackage();

      if (cp !== jdJinRongId && cp !== autojsId) {
        return false;
      }

      return idContains('iv_fifth_icon').findOnce();
    },
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
