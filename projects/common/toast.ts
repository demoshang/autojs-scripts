importClass(android.widget.Toast);

const showToast = (() => {
  let myToast: any;
  let lastTimer: any;

  return (msg: string, duration = 3500) => {
    if (myToast) {
      myToast.cancel();
    }

    if (lastTimer) {
      clearTimeout(lastTimer);
    }

    lastTimer = setTimeout(() => {
      if (myToast) {
        myToast.cancel();
      }
    }, duration);

    ui.run(() => {
      const Toast = new android.widget.Toast(context);
      myToast = Toast.makeText(context, msg, Toast.LENGTH_LONG);
      myToast.show();
    });
  };
})();

function tl(...msg: any[]): void {
  console.info(...msg);

  const text = msg
    .map((item) => {
      try {
        if (typeof item === 'object') {
          return JSON.stringify(item);
        }
        return item;
      } catch (e) {
        return '|-格式化失败-|';
      }
    })
    .join('; ');

  showToast(text);
}

export { showToast, tl };
