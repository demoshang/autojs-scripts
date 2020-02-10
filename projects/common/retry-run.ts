function retryRun(runFn: Function, killFn: Function, name = '', retryLimit = 3) {
  for (let i = 0; i < retryLimit; i += 1) {
    try {
      runFn();
      toastLog(`${name} 任务完成`);
      return true;
    } catch (e) {
      toastLog(`${name}  第${i}次运行失败: ${e.message}` || e);
      sleep(1000);

      killFn();
    }
  }

  return false;
}

export { retryRun };
