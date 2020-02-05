async function checkFloaty() {
  let hadPermission = false;
  const floatyThreads = threads.start(() => {
    const w = floaty.window('./check-floaty.xml');

    w.setSize(0, 0);
    w.close();

    hadPermission = true;
  });

  floatyThreads.waitFor();

  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (hadPermission) {
        resolve(hadPermission);
        clearInterval(interval);
      }
    }, 200);

    setTimeout(() => {
      floatyThreads.interrupt();

      resolve(hadPermission);
      clearInterval(interval);
    }, 1000);
  });
}

export { checkFloaty };
