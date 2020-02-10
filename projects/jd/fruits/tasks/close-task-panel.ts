import { boundsClick } from './click-ele-bounds';

function getTaskPanelCloseEle() {
  return className('android.view.View')
    .scrollable(true)
    .findOnce()
    ?.parent()
    .children()
    ?.get(2);
}

function close() {
  boundsClick(getTaskPanelCloseEle());
}

export { close };
