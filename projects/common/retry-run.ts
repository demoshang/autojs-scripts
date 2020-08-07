import { tl } from './toast';

function retryRun(
  runFn: () => void,
  killFn: () => void,
  name = '',
  retryLimit = 3
): boolean {
  for (let i = 0; i < retryLimit; i += 1) {
    try {
      runFn();
      tl(`${name} 任务完成`);
      return true;
    } catch (e) {
      tl(`${name}  第${i}次运行失败: ${e.message}` || e);
      sleep(1000);

      killFn();
    }
  }

  return false;
}

export { retryRun };
