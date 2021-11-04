import { $ } from '../ui-object';
import { JD_MALL } from './constants';
import { openAppWithCheck } from './open-with-check';

function openJDMall(wait?: number, confirmCheck?: number) {
  return openAppWithCheck({
    packageName: JD_MALL,
    className: 'com.jingdong.app.mall.main.MainActivity',
    checkIsIn: () => {
      return !!$('我的');
    },

    wait,
    confirmCheck,
  });
}

export { openJDMall };
