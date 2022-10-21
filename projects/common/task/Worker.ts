import { tl } from '../toast';
import { $$ } from '../ui-object';
import { Task } from './Task';

interface History {
  current: number;
  max: number;
}

enum TaskStatus {
  initialized = 'initialized',
  running = 'running',
  failed = 'failed',
  ended = 'ended',
  suspend = 'suspend',
}

type CustomTaskSkip = (task: Task) => boolean;

interface WorkerConfig {
  name: string;
  openApp: () => boolean;
  killApp: () => void;

  runTask: (task: Task, index: number) => void;
  keepInTaskPage: () => void;

  queryTask?: (index?: number) => Task[];
  taskSkip?: CustomTaskSkip;
  taskRetires?: number;
  workerRetires?: number;

  destroy?: () => void;
}

class Worker {
  // 已经执行的历史记录
  private historyMapping: { [key: string]: History } = {};

  // 当前正在执行的线程
  private thread: threads.Thread | null = null;

  // 声音按键监听
  private volumeThread: threads.Thread;

  // 当前内部状态, 实际使用  taskStatus
  private innerStatus = TaskStatus.initialized;

  // 当前运行次数
  private currentIndex = 0;
  // 最大运行次数
  private workerRetires: number;

  private em = events.emitter();

  public constructor(private config: WorkerConfig) {
    this.workerRetires = config.workerRetires ?? 3;

    this.volumeThread = this.volumeListen();
  }

  public start() {
    if (this.taskStatus === TaskStatus.running) {
      tl('任务正在执行中, 不做任何操作', this.config.name);
      return;
    }

    if (
      this.taskStatus !== TaskStatus.suspend &&
      this.currentIndex > this.workerRetires
    ) {
      tl('已经达到最大次数, 销毁程序', this.config.name);
      this.destroy();
      return;
    }

    let isOpenAppSuccess = true;
    if (this.taskStatus === TaskStatus.suspend) {
      tl(`执行任务 ${this.config.name}`);
    } else {
      // 状态为 ended 或 initialized 或 failed
      this.currentIndex = this.currentIndex + 1;
      // 清空历史记录
      this.historyMapping = {};

      tl(`尝试第 ${this.currentIndex} 次执行`, this.config.name);

      // 不是第一次执行, 需要先把app杀掉
      if (this.taskStatus !== TaskStatus.initialized) {
        sleep(1000);
        this.config.killApp();
        sleep(1000);
      }

      tl(`打开 [${this.config.name}] 应用中`);
      isOpenAppSuccess = this.config.openApp();
      sleep(1000);
    }

    // 更新线程定时器
    this.updateEventEmitter();

    // 删除上次线程
    this.closeThread();

    // 子线程监听脚本
    this.thread = threads.start(() => {
      try {
        if (!isOpenAppSuccess) {
          throw new Error('打开 APP 失败');
        }

        // 标记为正在运行
        this.taskStatus = TaskStatus.running;
        // 开始运行
        this.run();

        // 正常执行, 那就是执行完成
        this.taskStatus = TaskStatus.ended;
      } catch (e) {
        console.warn(e);

        this.taskStatus = TaskStatus.failed;
      }
    });
  }

  public suspend() {
    this.closeThread();

    this.taskStatus = TaskStatus.suspend;
  }

  public destroy() {
    // 清除执行进程
    this.closeThread();

    // 清除 volume 进程
    this.volumeThread.interrupt();

    this.em.removeAllListeners();

    // 重置状态
    this.taskStatus = TaskStatus.ended;

    if (this.config.destroy) {
      this.config.destroy();
    }
  }

  // 去除老的监听, 防止线程阻塞
  private updateEventEmitter() {
    this.em.removeAllListeners();

    this.em.on('status', (state) => {
      console.log('状态变更: ', state);

      const status = state.after;
      if (status === TaskStatus.ended || status === TaskStatus.failed) {
        this.start();
      }
    });
  }

  private closeThread() {
    if (this.thread) {
      this.thread.interrupt();
      this.thread = null;
    }
  }

  private get taskStatus(): TaskStatus {
    return this.innerStatus;
  }

  private set taskStatus(status: TaskStatus) {
    const state = { before: this.innerStatus, after: status };

    this.innerStatus = status;

    this.em.emit('status', state);
  }

  private run() {
    this.config.keepInTaskPage();

    let index = 0;
    while (true) {
      let tasks: Task[];

      if (this.config.queryTask) {
        tasks = this.config.queryTask(index);
      } else {
        tasks = $$(/.*\(\d+\/\d+.*/).map((ele) => {
          const container = ele.parent();
          return new Task({ container });
        });
      }

      const task = this.getValidTask(tasks);

      if (!task) {
        tl('没有任务可以执行');
        break;
      }

      const history = this.getHistory(task);

      this.config.runTask(task, history?.current ?? 1);

      this.config.keepInTaskPage();

      index += 1;
    }
  }

  private getValidTask(tasks: Task[]) {
    const { taskSkip } = this.config;

    let taskResult: Task | undefined;
    while (true) {
      const task = tasks.shift();

      // 没有任务了
      if (!task) {
        break;
      }

      // 重试次数达到上限
      const history = this.getHistory(task);
      if (history && history.current >= history.max) {
        if (history.current === history.max) {
          tl(`重试次数达到上限, 跳过任务 [${task.title}]  ${history.current}`);

          this.updateHistory(task, {
            current: history.max + 1,
          });
        }
        continue;
      }

      // 任务完成情况
      const taskCount = task.taskCount;
      if (!taskCount) {
        continue;
      }
      // 任务已完成
      if (taskCount.left === 0) {
        continue;
      }

      // 没有用户自定义筛选
      if (!taskSkip) {
        taskResult = task;
        break;
      }

      // 自定义筛选
      const isSkip = taskSkip(task);
      if (isSkip) {
        continue;
      }

      taskResult = task;
      break;
    }

    if (!taskResult) {
      return null;
    }

    // 记录历史
    const history = this.getHistory(taskResult);
    this.updateHistory(taskResult, {
      current: (history?.current ?? 0) + 1,
    });

    return taskResult;
  }

  private getHistoryTitle(task: Task | string) {
    let title: string;
    if (typeof task === 'string') {
      title = task;
    } else {
      title = task.title;
    }

    return title;
  }

  private getHistory(task: Task | string): History | undefined {
    return this.historyMapping[this.getHistoryTitle(task)];
  }

  private updateHistory(task: Task | string, value: Partial<History>) {
    const title = this.getHistoryTitle(task);

    const old = this.getHistory(title);

    this.historyMapping[title] = {
      max: this.config.taskRetires ?? 3,
      current: 0,
      ...old,
      ...value,
    };
  }

  private volumeListen() {
    let lastTime = Date.now();

    return threads.start(() => {
      events.setKeyInterceptionEnabled('volume_up', true);
      // 启用按键监听
      events.observeKey();
      // 监听音量上键按下
      events.onKeyDown('volume_up', () => {
        if (Date.now() - lastTime < 1000) {
          tl('退出整个 App');
          this.destroy();
          exit();
        } else if (this.taskStatus === TaskStatus.running) {
          tl(`暂停执行脚本 [${this.config.name}]`);
          this.suspend();
        } else if (this.taskStatus === TaskStatus.ended) {
          tl(`脚本执行完成 [${this.config.name}], 不做操作`);
        } else {
          tl(`重新执行脚本 [${this.config.name}]`);
          this.start();
        }

        lastTime = Date.now();
      });
    });
  }
}

export { Worker };
