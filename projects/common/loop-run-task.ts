import { boundsClick } from './click-ele-bounds';
import { delayCheck } from './delay-check';
import { floatyDebug } from './floaty-debug';
import {
  getTaskCount as defaultGetTaskCount,
  getTaskDelay as defaultGetTaskDelay,
  TaskCountResult,
} from './get-task-count';
import { scrollPage } from './scroll';
import { tl } from './toast';

interface LastResult {
  total: number;
  completed: number;
  left: number;
  retries: number;
  max: number;
}

function loopCheck({
  name,
  lastResult,
  ele,
  getBtn,
  getTaskCount = defaultGetTaskCount,
  getTaskDelay = defaultGetTaskDelay,
}: {
  name: string | undefined | null;
  lastResult: LastResult;
  ele: UiObject | undefined | null;
  getBtn: (ele: UiObject) => UiObject | null | undefined;
  getTaskCount?: {
    (ele?: UiObject | null | undefined): TaskCountResult | null;
    (text?: string | undefined): TaskCountResult | null;
  };
  getTaskDelay?: (
    item?: string | UiObject | undefined,
    taskName?: string | RegExp | undefined,
    defaultDelay?: number
  ) => number;
}): {
  taskCount: TaskCountResult;
  delay: number;
  taskBtn: UiObject;
} {
  if (!ele) {
    throw new Error(`no ${name} task found`);
  }

  const taskBtn = getBtn(ele);
  const taskCount = getTaskCount(ele);
  const delay = getTaskDelay(ele);

  if (!taskBtn) {
    throw new Error(`[${name}] 未找到任务按钮`);
  }

  if (!taskCount) {
    throw new Error(`[${name}] 未找到任务数据`);
  }

  if (lastResult.left !== taskCount.left) {
    // eslint-disable-next-line no-param-reassign
    lastResult.retries = 0;
  }

  return {
    taskCount,
    delay,
    taskBtn,
  };
}

function loopRunTask({
  ele,
  getEle,
  name,
  checkIsInTask,
  getBtn = (o: UiObject) => {
    return o.findOne(textMatches(/去(完成|浏览)/));
  },
  runTask = (taskBtn, delay, pre, after) => {
    boundsClick(taskBtn);
    sleep(pre);
    scrollPage();
    sleep(delay);
    sleep(after);
  },
  waitFinished = () => {
    delayCheck(5000, 1000, () => {
      return !!(
        descMatches(/.*任务.*完成.*/).findOnce() ||
        textMatches(/.*任务.*完成.*/).findOnce()
      );
    });
  },
  checkBackToTask = (check) => {
    return delayCheck(
      5000,
      1000,
      () => {
        return check();
      },
      () => {
        back();
        sleep(1000);
      }
    );
  },
  lastResult = {
    total: 0,
    completed: 0,
    left: 0,
    retries: 0,
    max: 3,
  },
  preMs = 3000,
  afterMs = 0,
  afterBack = () => {},
}: {
  ele?: UiObject | null;
  getEle?: () => UiObject | null | undefined;
  checkIsInTask: () => boolean;
  name?: string;
  getBtn?: (o: UiObject) => UiObject | undefined | null;
  runTask?: (
    taskBtn: UiObject,
    delay: number,
    perMs: number,
    afterMs: number
  ) => void;
  waitFinished?: () => void;
  checkBackToTask?: (checkIsInTask: () => boolean) => boolean;
  lastResult?: LastResult;
  preMs?: number;
  afterMs?: number;
  afterBack?: () => void;
}): void {
  if (lastResult.retries > lastResult.max) {
    tl(`⚠️警告: ${name} 任务失败, 重试过多`);
    return;
  }

  if (getEle) {
    // eslint-disable-next-line no-param-reassign
    ele = getEle() || ele;
  }

  floatyDebug(ele);

  let taskCount;
  let delay;
  let taskBtn;

  try {
    ({ taskCount, delay, taskBtn } = loopCheck({
      name,
      lastResult,
      ele,
      getBtn,
    }));
  } catch (e) {
    console.warn(e);
    tl(`⚠️警告: ${e.message}`);

    loopRunTask({
      ele,
      getEle,
      name,
      checkIsInTask,
      getBtn,
      runTask,
      waitFinished,
      checkBackToTask,
      lastResult: {
        ...lastResult,
        retries: lastResult.retries + 1,
        max: lastResult.max,
      },
    });

    return;
  }

  if (taskCount.left === 0) {
    console.info(`${name} 任务完成, ${JSON.stringify(taskCount)}`);
    return;
  }

  runTask(taskBtn, delay, preMs, lastResult.retries * afterMs);

  if (delay >= 2000) {
    waitFinished();
  }

  const isInTask = checkBackToTask(checkIsInTask);

  if (!isInTask) {
    throw new Error('不在任务面板');
  }

  afterBack();

  loopRunTask({
    ele,
    getEle,
    name,
    checkIsInTask,
    getBtn,
    runTask,
    waitFinished,
    checkBackToTask,
    lastResult: {
      ...taskCount,
      retries: lastResult.retries + 1,
      max: lastResult.max,
    },
  });
}

export { loopCheck, loopRunTask };
