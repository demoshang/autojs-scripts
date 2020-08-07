const getCaptureImage = (() => {
  let isChecked = false;

  return () => {
    if (!isChecked) {
      if (!images.requestScreenCapture()) {
        throw new Error('请求截图失败');
      }

      isChecked = true;
    }

    const img = images.captureScreen();
    if (!img) {
      throw new Error('截图失败');
    } else {
      return img;
    }
  };
})();

const getImageWithCache = (() => {
  const cache: { [key: string]: Image } = {};

  return (value: string) => {
    if (!cache[value]) {
      cache[value] = images.read(value);
    }
    return cache[value];
  };
})();

function matchScreenMatches(
  img: Image,
  options: { threshold?: number; region?: any; max?: number }
): {
  point: Point;
  similarity: number;
}[] {
  const screenImage = getCaptureImage();
  const result = images.matchTemplate(screenImage, img, options);

  screenImage.recycle();

  return result.matches;
}

export { getCaptureImage, getImageWithCache, matchScreenMatches };
