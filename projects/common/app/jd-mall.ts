import { $ } from '../ui-object';
import { JD_MALL } from './constants';
import { openApp } from './open-with-check';

function openJDMall(wait?: number, confirmCheck?: number) {
  return openApp({
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
