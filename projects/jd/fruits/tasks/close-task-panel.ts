import { boundsClick } from '../../../common/click-ele-bounds';

function getTaskPanelCloseEle() {
  try {
    return textContains('领水滴')
      .findOnce()
      ?.parent()
      ?.parent()
      .children()
      .get(2);
  } catch (e) {
    console.warn(e);
    return undefined;
  }
}

function closeTaskPanel() {
  boundsClick(getTaskPanelCloseEle());
}

export { closeTaskPanel };
