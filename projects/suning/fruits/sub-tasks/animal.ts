import { collect } from './collect';

function collectAnimal() {
  const catchImage = images.read('./assets/match-template/catch.png');

  collect({
    image: catchImage,
    options: { threshold: 0.5 },
  });

  catchImage.recycle();
}

function addAnimals() {
  const addImage = images.read('./assets/match-template/add.png');
  collect(
    {
      image: addImage,
      options: { threshold: 0.5 },
    },
    1
  );

  const ele = textMatches(/成熟:\s*\d+小时/).findOnce();

  if (!ele) {
    toastLog('不需要养殖动物');
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
