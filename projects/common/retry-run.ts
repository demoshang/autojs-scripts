function retryRun(runFn: Function, killFn: Function, retryLimit = 3) {
  for (let i = 0; i < retryLimit; i += 1) {
    try {
      runFn();
      toastLog('运行成功');
      return true;
    } catch (e) {
      toastLog(`运行失败: ${i}  ${e.message}` || e);
      sleep(1000);

      killFn();
    }
  }

  return false;
}

export { retryRun };
