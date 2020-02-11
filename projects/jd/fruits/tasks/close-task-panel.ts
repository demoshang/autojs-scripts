import { boundsClick } from '../../../common/click-ele-bounds';

function getTaskPanelCloseEle() {
  return className('android.view.View')
    .scrollable(true)
    .findOnce()
    ?.parent()
    .children()
    ?.get(2);
}

function closeTaskPanel() {
  boundsClick(getTaskPanelCloseEle());
}

export { closeTaskPanel };
