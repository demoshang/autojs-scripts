import { delayCheck } from '../../../common/delay-check';
import { tl } from '../../../common/toast';
import { findAndClick } from './find-click';
import { pressClose } from './press-close';
import { throwVerification } from './verification-check';

function collectAnimal() {
  const catchImage = images.read('./assets/match-template/catch.png');

  findAndClick(
    {
      image: catchImage,
      options: { threshold: 0.7 },
    },
    undefined,
    () => {
      throwVerification();

      sleep(1000);
    }
  );

  catchImage.recycle();
}

function addAnimals() {
  const addImage = images.read('./assets/match-template/add.png');

  const ele = delayCheck(
    10000,
    1500,
    () => {
      return textMatches(/成熟:\s*\d+小时/).findOnce();
    },
    () => {
      pressClose();

      findAndClick(
        {
          image: addImage,
          options: { threshold: 0.5 },
        },
        1
      );
    }
  );

  if (!ele) {
    tl('不需要养殖动物');
    return;
  }

  let bounds = ele.bounds();

  // 滑动 动物选择器, 选择最后一个种植
  for (let i = 0; i < 8; i += 1) {
    swipe(device.width / 2, bounds.centerY(), 0, bounds.centerY(), 100);
  }

  const collection = textContains('养殖').find();
  const addBtn = collection.get(collection.size() - 1);

  bounds = addBtn.bounds();

  // 直接种最大次数
  for (let i = 0; i < 8; i += 1) {
    click(bounds.centerX(), bounds.centerY());
    sleep(1000);
  }
}

export { collectAnimal, addAnimals };
