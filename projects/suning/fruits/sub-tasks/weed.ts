import { findAndClick } from './find-click';
import { pressClose } from './press-close';

function weed() {
  const weedImage = images.read('./assets/match-template/weed.png');

  findAndClick(
    {
      image: weedImage,
      options: {
        threshold: 0.5,
      },
    },
    undefined,
    () => {
      sleep(3000);
      pressClose();
    }
  );

  weedImage.recycle();
}

export { weed };
