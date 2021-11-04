import { $ } from '../ui-object';
import { JD_JR } from './constants';
import { openAppWithCheck } from './open-with-check';

function openJDJR(wait?: number, confirmCheck?: number) {
  return openAppWithCheck({
    packageName: JD_JR,
    className: 'com.jd.jrapp.bm.mainbox.main.MainActivity',
    checkIsIn: () => {
      return !!$('#iv_fifth_icon');
    },

    wait,
    confirmCheck,
  });
}

export { openJDJR };
