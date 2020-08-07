import { delayCheck } from '../../../common/delay-check';
import { getCaptureImage } from '../../../common/image';
import { tl } from '../../../common/toast';
import { collectAnimal } from './animal';
import { getPosition } from './find-click';
import { pressClose } from './press-close';

function getStealRandomPosition() {
  const screenImage = getCaptureImage();
  const template = images.read('./assets/match-template/steal-random.png');

  const positions = getPosition(screenImage, template, { threshold: 0.1 });
  console.info(positions);

  screenImage.recycle();
  template.recycle();

  if (!positions.length) {
    throw new Error('find steal random btn failed');
  }

  positions.sort(({ y: y1 }, { y: y2 }) => {
    return y1 - y2;
  });

  return positions[0];
}

function getTaskPosition() {
  const screenImage = getCaptureImage();
  const template = images.read('./assets/match-template/steal.png');

  const positions = getPosition(screenImage, template, { threshold: 0.1 });

  screenImage.recycle();
  template.recycle();

  if (positions.length !== 1) {
    throw new Error('find steal btn failed');
  }

  return positions[0];
}

function stealRandom(
  taskPosition: { x: number; y: number },
  stealRandomPosition: { x: number; y: number }
) {
  click(taskPosition.x, taskPosition.y);
  sleep(1000);
  click(stealRandomPosition.x, stealRandomPosition.y);

  const result = delayCheck(10000, 500, () => {
    return textContains('TA的成就').findOnce();
  });

  if (result) {
    sleep(3000);
    collectAnimal();

    back();
    sleep(3000);
    stealRandom(taskPosition, stealRandomPosition);
  } else if (textContains('去TA的农场偷金币').findOnce()) {
    pressClose();
  } else {
    throw new Error('进入TA的农场失败');
  }
}

function steal(): void {
  const taskPosition = getTaskPosition();

  click(taskPosition.x, taskPosition.y);
  sleep(1000);

  const stealRandomPosition = getStealRandomPosition();

  stealRandom(taskPosition, stealRandomPosition);
  tl('done');
}

export { steal };
