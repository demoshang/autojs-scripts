import { boundsClick } from './click-ele-bounds';
import { delayCheck } from './delay-check';
import { scrollIn, scrollPage } from './scroll';
import { tl } from './toast';
import { getUiObject } from './ui-object';

const autojsId = 'org.autojs.autojs';

const jdApplicationId = 'com.jingdong.app.mall';
const suningApplicationId = 'com.suning.mobile.ebuy';
const taobaoId = 'com.taobao.taobao';
const jdJinRongId = 'com.jd.jrapp';
const wechatId = 'com.tencent.mm';

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

function openMINA(
  name: string | RegExp,
  timeout = 10000,
  delay = 500,
): boolean {
  app.startActivity({
    action: 'android.intent.action.VIEW',
    packageName: wechatId,
    className: 'com.tencent.mm.ui.LauncherUI',
  });

  sleep(1000);

  // 存在微信分身
  if (getUiObject(/打开方式/)) {
    boundsClick(getUiObject(/微信/));
  }

  const isInWechat = skipAd({
    timeout,
    delay,
    mainPageCheck: () => {
      const cp = currentPackage();

      if (cp !== wechatId && cp !== autojsId) {
        return false;
      }

      return getUiObject(/^发现$|^我的小程序$/);
    },
  });

  if (!isInWechat) {
    return false;
  }

  tl(`进入发现页->小程序->寻找 [${name}] 小程序`);

  delayCheck(
    5000,
    500,
    () => {
      return getUiObject(/我的小程序/);
    },
    () => {
      boundsClick(getUiObject(/发现/)?.parent());
      sleep(1000);
      boundsClick(getUiObject(/^小程序$/));
      sleep(1000);
    },
  );

  const isFind = delayCheck(
    5000,
    200,
    () => {
      return getUiObject(name);
    },
    () => {
      scrollPage(200);
    },
    false,
  );

  if (!isFind) {
    return false;
  }

  scrollIn(getUiObject(name));
  sleep(2000);

  boundsClick(getUiObject(name));

  return true;
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

function openJDNoCheck() {
  app.startActivity({
    action: 'android.intent.action.VIEW',
    packageName: jdApplicationId,
    className: 'com.jingdong.app.mall.main.MainActivity',
  });

  const adRun = () => {
    // 是否存在广告
    const jumpBtn = getUiObject('跳过');
    if (jumpBtn) {
      tl('检测到广告, 正在执行跳过');
      boundsClick(jumpBtn);
      return true;
    }

    return false;
  };

  const checkIsMain = () => {
    if (currentPackage() !== jdApplicationId) {
      return false;
    }

    return !!desc('我的').findOnce();
  };

  let index = 0;
  return delayCheck(5000, 1000, () => {
    const isAd = adRun();

    // 是广告, 就略过
    if (isAd) {
      return false;
    }

    // 主界面能找到
    if (checkIsMain()) {
      if (index < 2) {
        index += 1;
        return false;
      }

      return true;
    }

    return false;
  });
}

function openJDJRNoCheck() {
  app.startActivity({
    action: 'android.intent.action.VIEW',
    packageName: jdJinRongId,
    className: 'com.jd.jrapp.bm.mainbox.main.MainActivity',
  });

  const adRun = () => {
    // 是否存在广告
    const jumpBtn = getUiObject('跳过');
    if (jumpBtn) {
      tl('检测到广告, 正在执行跳过');
      boundsClick(jumpBtn);
      return true;
    }

    return false;
  };

  const checkIsMain = () => {
    const cp = currentPackage();

    if (cp !== jdJinRongId && cp !== autojsId) {
      return false;
    }

    return idContains('iv_fifth_icon').findOnce();
  };

  let index = 0;
  return delayCheck(5000, 1000, () => {
    const isAd = adRun();

    // 是广告, 就略过
    if (isAd) {
      return false;
    }

    // 主界面能找到
    if (checkIsMain()) {
      if (index < 2) {
        index += 1;
        return false;
      }

      return true;
    }

    return false;
  });
}

export {
  suningApplicationId,
  jdApplicationId,
  jdJinRongId,
  taobaoId,
  wechatId,
  openPage,
  openSuning,
  openJDMain,
  openJDJR,
  openTaoBaoMain,
  openMINA,
  openJDNoCheck,
  openJDJRNoCheck,
};
