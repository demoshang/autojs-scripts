import { killApp } from '../kill-app';
import { JD_JR, JD_MALL } from './constants';
import { openJDJR } from './jd-jr';
import { openJDMall } from './jd-mall';

function buildJdMall() {
  return {
    openApp: openJDMall,
    killApp: () => {
      return killApp(JD_MALL);
    },
  };
}

function buildJdJR() {
  return {
    openApp: openJDJR,
    killApp: () => {
      return killApp(JD_JR);
    },
  };
}

export { buildJdMall, buildJdJR };
