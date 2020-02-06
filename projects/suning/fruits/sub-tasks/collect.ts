import { floatyDebug } from '../../../common/floaty-debug';
import { getCaptureImage } from '../../../common/image';

function getPosition(
  screenImage: Image,
  template: Image,
  options: MatchTemplateOptions = {
    threshold: 0.5,
  }
) {
  const m1 = images.matchTemplate(screenImage, template, options);

  return m1.matches.map(({ point }) => {
    return {
      x: point.x + 5,
      y: point.y + 5,
    };
  });
}

type PositionFn = (screenImage: Image) => { x: number; y: number }[];
type CollectParams =
  | {
      image: Image;
      options: MatchTemplateOptions;
    }
  | PositionFn;

function collect(
  config: { image: Image; options: MatchTemplateOptions },
  lastPositionsLen?: number
): void;
function collect(
  positionFn: (screenImage: Image) => { x: number; y: number }[],
  lastPositionsLen?: number
): void;
function collect(fnOrParams: CollectParams, lastPositionsLen = 0): void {
  const screenImage = getCaptureImage();

  let positions;

  if (typeof fnOrParams === 'function') {
    positions = fnOrParams(screenImage);
  } else {
    positions = getPosition(screenImage, fnOrParams.image, fnOrParams.options);
  }

  positions.forEach(({ x, y }) => {
    toastLog(`press: ${JSON.stringify({ x, y })}`);

    floatyDebug(1000, { radius: 10, x, y });
    press(x, y, 100);
    sleep(1000);

    // const clip = images.clip(screenImage, x - 100, y - 100, 200, 200);
    // images.save(clip, `/storage/emulated/0/Scripts/temp/coin.${i}.png`);
  });

  screenImage.recycle();
  if (positions.length !== lastPositionsLen) {
    collect(fnOrParams as PositionFn, positions.length);
  }
}

export { getPosition, collect };
