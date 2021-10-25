import { floatyDebug } from './floaty-debug';
import { getCaptureImage } from './image';
import { isImage } from './type-check';

function getPosition(
  screenImage: Image,
  template: Image,
  options: MatchTemplateOptions = {
    threshold: 0.5,
  },
): {
  x: number;
  y: number;
  similarity: number;
}[] {
  const m1 = images.matchTemplate(screenImage, template, options);

  return m1.matches
    .filter(({ point }) => {
      // 上面的任务栏
      return point.y > 100;
    })
    .map(({ point, similarity }) => {
      return {
        x: point.x + 5,
        y: point.y + 5,
        similarity,
      };
    });
}

type PositionFn = (screenImage: Image) => { x: number; y: number }[];
type CollectParams =
  | {
      image: Image;
      options?: MatchTemplateOptions;
    }
  | PositionFn
  | Image;

function findAndClick(
  image: Image,
  lastPositionsLen?: number,
  afterRun?: () => void,
): void;
function findAndClick(
  config: { image: Image; options?: MatchTemplateOptions },
  lastPositionsLen?: number,
  afterRun?: () => void,
): void;
function findAndClick(
  positionFn: (screenImage: Image) => { x: number; y: number }[],
  lastPositionsLen?: number,
  afterRun?: () => void,
): void;
function findAndClick(
  fnOrParams: CollectParams,
  lastPositionsLen = 0,
  afterRun?: () => void,
): void {
  const screenImage = getCaptureImage();

  let positions;

  if (typeof fnOrParams === 'function') {
    positions = fnOrParams(screenImage);
  } else if (isImage(fnOrParams)) {
    positions = getPosition(screenImage, fnOrParams);
  } else {
    positions = getPosition(screenImage, fnOrParams.image, fnOrParams.options);
  }

  console.log('floatyDebug positions', { positions });

  floatyDebug(1000, ...positions);

  positions.forEach(({ x, y }) => {
    press(x, y, 100);
    sleep(1000);
  });

  screenImage.recycle();
  if (positions.length !== lastPositionsLen) {
    if (afterRun) {
      afterRun();
    }
    findAndClick(fnOrParams as PositionFn, positions.length, afterRun);
  }
}

export { getPosition, findAndClick };
