import { findAndClick } from './find-click';
import { pressClose } from './press-close';

function weed(): void {
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
      pressClose();
    }
  );

  weedImage.recycle();

  pressClose();
}

export { weed };
