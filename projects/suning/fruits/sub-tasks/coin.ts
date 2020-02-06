import { collect } from './collect';

function collectCoin() {
  const coinImage = images.read('./assets/match-template/coin.png');

  collect({
    image: coinImage,
    options: {
      threshold: 0.5,
      region: [device.width * (2 / 5), 0, device.width * (3 / 5), device.height / 4],
    },
  });

  coinImage.recycle();
}

export { collectCoin };
