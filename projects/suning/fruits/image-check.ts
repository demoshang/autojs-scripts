import { getCaptureImage } from '../../common/image';
import { floatyDebug } from '../../common/floaty-debug';
import { getPosition } from './sub-tasks/find-click';

console.show();

function imageCheck() {
  const screenImage = getCaptureImage();
  const template = images.read('./assets/match-template/steal-random.png');

  const pisitions = getPosition(screenImage, template, { threshold: 0.1 });
  console.info(pisitions);

  screenImage.recycle();
  template.recycle();

  floatyDebug(15000, ...pisitions);

  // const screenImage = getCaptureImage();

  // images.save(screenImage, '/storage/emulated/0/Scripts/temp/bg.png');

  toastLog('done');
}

export { imageCheck };
