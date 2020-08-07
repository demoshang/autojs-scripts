import { findAndClick } from './find-click';

function pressClose(): void {
  const image = images.read('./assets/match-template/close.png');
  findAndClick({
    image,
    options: { threshold: 0.5 },
  });
  image.recycle();
}

export { pressClose };
