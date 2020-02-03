import { getUi } from './get-ui';

async function checkFloaty() {
  let hadPermission = false;
  const floatyThreads = threads.start(() => {
    const w = getUi<any>('floatyCheck');

    w.setSize(-1, -1);
    w.setTouchable(false);
    w.close();
    hadPermission = true;
  });

  floatyThreads.waitFor();
  floatyThreads.interrupt();

  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (hadPermission) {
        resolve(hadPermission);
        clearInterval(interval);
      }
    }, 200);

    setTimeout(() => {
      resolve(hadPermission);
      clearInterval(interval);
    }, 1000);
  });
}

export { checkFloaty };
