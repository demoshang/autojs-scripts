function bezierCurves(cp: any, t: number) {
  const cx = 3.0 * (cp[1].x - cp[0].x);
  const bx = 3.0 * (cp[2].x - cp[1].x) - cx;
  const ax = cp[3].x - cp[0].x - cx - bx;
  const cy = 3.0 * (cp[1].y - cp[0].y);
  const by = 3.0 * (cp[2].y - cp[1].y) - cy;
  const ay = cp[3].y - cp[0].y - cy - by;

  const tSquared = t * t;
  const tCubed = tSquared * t;
  const result = {
    x: 0,
    y: 0,
  };
  result.x = ax * tCubed + bx * tSquared + cx * t + cp[0].x;
  result.y = ay * tCubed + by * tSquared + cy * t + cp[0].y;
  return result;
}

// 仿真随机带曲线滑动
function smlMove({
  from: { x: qx, y: qy },
  to: { x: zx, y: zy },
  time = 1000,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  time?: number;
}): void {
  const xxy = [];

  const point = [];
  const dx0 = {
    x: qx,
    y: qy,
  };

  const dx1 = {
    x: random(qx - 100, qx + 100),
    y: random(qy, qy + 50),
  };
  const dx2 = {
    x: random(zx - 100, zx + 100),
    y: random(zy, zy + 50),
  };
  const dx3 = {
    x: zx,
    y: zy,
  };

  point.push(...[dx1, dx2, dx3, dx0]);
  console.log(point[3].x);

  for (let i = 0; i < 1; i += 0.08) {
    const temp: [number, number] = [
      parseInt(`${bezierCurves(point, i).x}`, 10),
      parseInt(`${bezierCurves(point, i).y}`, 10),
    ];

    xxy.push(temp);
  }

  console.log(xxy);
  gesture(time, xxy[0], xxy[1], ...xxy.slice(2));
}

export { smlMove };
