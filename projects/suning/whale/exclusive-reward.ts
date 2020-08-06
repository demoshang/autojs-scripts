import { boundsClick } from '../../common/click-ele-bounds';

function close() {
  const position = { x: device.width / 2, y: device.height - 100 };
  boundsClick(position);
}

function doExclusive() {
  const obj = textContains('每天9点开启')
    .findOnce()
    ?.parent()
    .parent()
    .children()
    .get(4)
    .children()
    .get(2);

  obj?.click();

  // TODO: 点击领取

  close();
}

export { doExclusive };
