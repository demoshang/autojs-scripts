import { findAndClick } from './find-click';
import { throwVerification } from './verification-check';

function collectCoin(): void {
  const coinImage = images.read('./assets/match-template/coin.png');

  findAndClick(
    {
      image: coinImage,
      options: {
        threshold: 0.5,
        region: [
          device.width * (2 / 5),
          0,
          device.width * (3 / 5),
          device.height / 4,
        ],
      },
    },
    undefined,
    () => {
      throwVerification();
      sleep(3000);
    }
  );

  coinImage.recycle();
}

export { collectCoin };
