import './src/index';
import { $, $$, getRelativeObject } from '@/common/ui-object';

import { floatyChildren, getChild } from '@/common/floaty-children';
import { floatyDebug } from '@/common/floaty-debug';
import { tl } from '@/common/toast';
import { run } from '@/jd/d11.2022';
import { Task } from '@/common/task/Task';
import { boundsClick } from '@/common/click-ele-bounds';

// floatyDebug();

// tl($('已签到'));

// floatyDebug($(/.*解锁.*次抽奖/));

// floatyChildren(
//   $(/.*解锁.*次抽奖/)
//     ?.parent()
//     ?.parent()
//     ?.parent()
//     ?.parent(),
//   { timeout: 1000, filter: null },
// );

// tl('start');

// floatyChildren($('做任务'), { concurrence: true });

// floatyChildren($('当前进度')?.parent()?.parent()?.parent()?.parent(), {
//   filter: null,
//   concurrence: true,
//   timeout: 5000,
// });

// floatyChildren(taskPanel, { concurrence: true, filter: null, timeout: 5000 });

// floatyDebug(closeBtn);

// tl(closeBtn);

// queryTask();

// const taskPanel = $('当前进度')?.parent()?.parent()?.parent()?.parent();
// floatyDebug(getChild(taskPanel, [1, 1, 0, 0]));

// 1101/110410
// floatyChildren(taskPanel, { concurrence: true });

// floatyDebug(getRelativeObject(getChild(taskPanel, [1, 1, 0, 5, 0, 5]), -1));

// floatyDebug(getChild(taskPanel, [1, 1, 0, 5, 0, 4]));

// run(0);

// tl($(/金币/));

// const bottomEle = $('距离下次抽到分红')?.parent()?.parent();

// floatyDebug(bottomEle);

// 01930
// const root = $(/.*/);

// floatyChildren(root, { concurrence: true });

// l2View();

// let goBtn = $(/^(去完成|去浏览)$/);
// let ele = getRelativeObject(goBtn, -1);
// tl($(ele, /.*\d+\/\d+.*/)?.text());

// boundsClick(goBtn);
// sleep(1000);
// back();

// sleep(3000);

// goBtn = $(/^(去完成|去浏览)$/);
// ele = getRelativeObject(goBtn, -1);
// tl($(ele, /.*\d+\/\d+.*/)?.text());

// const root = $('当前页点击浏览')?.parent()?.parent();

// floatyChildren(root, { concurrence: true, filter: 'visual-id-text-desc' });
// const v = getChild(ele, [1, 0, 4]);

// floatyDebug(v);

// tl(v);

// const root = $(/.*继续环游.*/)
//   ?.parent()
//   ?.parent()
//   ?.parent()
//   ?.parent()
//   ?.parent()
//   ?.parent();

// const root = $(/当前页.*浏览/)
//   ?.parent()
//   ?.parent();

// const pngs = $$(root, /.*\.(png|jpg)\!q\d+.*/);

// const product = pngs[1]?.parent()?.parent();
// const goBtn = getChild(product, 4);

// floatyDebug();
// floatyDebug(getChild(root, [0, 1, 0, 0]));

// floatyChildren(product, { concurrence: true });

// floatyChildren(root, { concurrence: true });

// const root = $(/.*/);
// tl(root);
// floatyChildren(root, { concurrence: true });
