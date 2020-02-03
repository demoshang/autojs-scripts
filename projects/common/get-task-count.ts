function getTaskCount(text: string) {
  if (!/(\d+)\/(\d+)/.test(text)) {
    throw new Error('未找到任务数');
  }

  const completed = parseInt(`${RegExp.$1}`, 10);
  const total = parseInt(`${RegExp.$2}`, 10);
  const left = total - completed;

  return {
    total,
    completed,
    left,
  };
}

export { getTaskCount };
