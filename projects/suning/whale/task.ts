import { boundsClick } from '../../common/click-ele-bounds';
import { delayCheck } from '../../common/delay-check';
import { collection2array } from '../../common/floaty-children';
import { getTaskDelay } from '../../common/get-task-count';
import { loopCheck } from '../../common/loop-run-task';
import { scrollIn, scrollPage } from '../../common/scroll';
import { tl } from '../../common/toast';
import { checkIsInTaskPanel, reopenTaskPanel } from './task-panel';

function getLastResult() {
  return {
    total: 0,
    completed: 0,
    left: 0,
    retries: 0,
    max: 5,
  };
}

const doLive = (() => {
  let scrollAppend = 0;
  return (scrollIndex: number) => {
    scrollAppend += 1;

    for (let i = 0; i < scrollIndex + scrollAppend; i += 1) {
      scrollPage();
      tl('scroll: ', i);
    }

    sleep(1000);

    const last = collection2array(idContains('tv_bottom_title').find()).pop();
    const data = scrollIn(() => {
      return collection2array(idContains('tv_bottom_title').find()).find(
        (ele) => {
          return ele.text() === last?.text();
        },
      );
    });

    tl('live for ', last?.text());

    if (!data) {
      return;
    }

    boundsClick(data);
    sleep(1000);

    // 等待任务完成
    delayCheck(8000, 1000, () => {
      return !!(
        descMatches(/.*任务.*完成.*/).findOnce() ||
        textMatches(/(.*任务.*完成.*)|(.*回去领奖.*)/).findOnce()
      );
    });
  };
})();

function doTask(): void {
  reopenTaskPanel();

  let taskNameList = collection2array(textMatches(/.*\(\d+\/\d+\).*/).find());
  const taskDetailList = collection2array(
    textMatches(/.*获得\d+鲸币.*/).find(),
  );

  let lastResult = getLastResult();

  for (let index = 0; index < taskNameList.length; index += 1) {
    if (!/逛会场|看直播|逛小苏的农庄/.test(taskNameList[index].text())) {
      tl('跳过任务', taskNameList[index].text());
      sleep(200);
      // eslint-disable-next-line no-continue
      continue;
    }

    // 重新打开界面可以刷新剩余次数
    reopenTaskPanel();
    taskNameList = collection2array(textMatches(/.*\(\d+\/\d+\).*/).find());

    const ele = taskNameList[index];
    const name = ele.text();

    tl('执行任务', name, lastResult);
    sleep(1000);

    const { taskCount, delay, taskBtn } = loopCheck({
      ele,
      name,
      lastResult,
      getBtn() {
        return scrollIn(() => {
          const taskBtnList = collection2array(
            textMatches(/(去(逛逛|邀请|完成|看直播))|(已完成)/).find(),
          );
          return taskBtnList[index];
        });
      },
      getTaskDelay() {
        return getTaskDelay(taskDetailList[index]);
      },
    });

    if (taskCount.left === 0) {
      console.info(`${name} 任务完成, ${JSON.stringify(taskCount)}`);
      // eslint-disable-next-line no-continue
      continue;
    }

    // 进入任务页面
    boundsClick(taskBtn);
    sleep(1000);

    if (textContains('直播领奖励').findOnce()) {
      tl('去看直播...', taskCount);

      doLive(taskCount.completed + 2);
    } else {
      scrollPage();

      // 等待任务完成
      delayCheck(delay + 5000, 1000, () => {
        return !!(
          descMatches(/.*任务.*完成.*/).findOnce() ||
          textMatches(/(.*任务.*完成.*)|(.*回去领奖.*)/).findOnce()
        );
      });
    }

    // 尝试返回
    delayCheck(
      5000,
      1000,
      () => {
        return checkIsInTaskPanel();
      },
      () => {
        back();
        sleep(1000);
      },
    );

    if (lastResult.retries > lastResult.max) {
      tl(`⚠️警告: ${name} 任务失败, 重试过多`);
      lastResult = getLastResult();
    } else {
      index -= 1;
      lastResult = {
        ...lastResult,
        ...taskCount,
        retries:
          taskCount.left === lastResult.left ? lastResult.retries + 1 : 0,
      };
    }
  }
}

export { doTask };
