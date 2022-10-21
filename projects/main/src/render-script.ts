import { tl } from '@/common/toast';
import { downloadFile, getScriptPath } from '@/third-party/download';

import addWidget from './script/add.xml';
import scriptWidget from './script/script-item.xml';

enum Status {
  visible = 0,
  invisible = 8,
}

enum ScriptType {
  remote = 'remote',
  local = 'local',
}

type LocalScript = {
  label: string;
  type: ScriptType.local;
} & ({ run: () => void; url?: string } | { url: string; run?: () => void });

interface RemoteScript {
  label: string;
  type: ScriptType.remote;
  url: string;
}

const SCRIPTS: (LocalScript | RemoteScript)[] = [
  {
    label: '饿了么-吃货豆',

    type: ScriptType.local,
    url: 'chihuodou.js',
  },

  // {
  //   label: '饿了么-水果',

  //   type: ScriptType.local,
  //   url: 'fruits.js',
  // },

  {
    label: '京东 双十一',

    type: ScriptType.local,
    url: 'jd-d11.js',
  },

  // {
  //   label: '饿了么-吃货豆-第三方',

  //   type: ScriptType.remote,
  //   url: 'https://gist.githubusercontent.com/demoshang/61c710bf786272a970d47d388eeb1c35/raw/3085e3490249ec12472ca5160d460ad298cb03c0/elm-auto.js',
  // },
];

function downloadScript(script: RemoteScript) {
  return downloadFile({
    url: script.url,
    key: script.label,
  }).then(({ filePath }) => {
    tl(`download success`, filePath);

    return filePath;
  });
}

function runScript(script: LocalScript | RemoteScript) {
  if (script.type === ScriptType.local) {
    if (script.run) {
      return script.run();
    }

    if (script.url) {
      const p = (engines.myEngine() as any).cwd();
      engines.execScriptFile(p + '/' + script.url);
      return;
    }

    return;
  }

  const filePath = getScriptPath(script.label);

  if (files.exists(filePath)) {
    engines.execScriptFile(filePath);
  } else {
    tl('下载脚本中...');

    downloadScript(script).then((fp) => {
      engines.execScriptFile(fp);
    });
  }
}

function render() {
  const list = SCRIPTS.map((scriptInfo, index) => {
    const { label, type } = scriptInfo;

    const widget = scriptWidget({ index, label });
    ui.container.addView(widget);

    const labelEle = widget.getChildAt(0);
    const downloadEle = widget.getChildAt(1).getChildAt(0);
    const delEle = widget.getChildAt(1).getChildAt(1);

    labelEle.click(() => {
      app.startActivity('console');

      runScript(scriptInfo);
    });

    if (type === ScriptType.local) {
      downloadEle.visibility = Status.invisible;
    } else {
      downloadEle.click(() => {
        tl('开始下载...');
        downloadScript(scriptInfo);
      });
    }

    delEle.click(() => {
      dialogs.confirm('确定删除吗?', undefined, undefined).then((v) => {
        if (v) {
          tl('删除');

          ui.container.removeView(widget);
        }
      });
    });

    return {
      widget,
      label: labelEle,
      download: downloadEle,
      del: delEle,
    };
  });

  const addEle = addWidget();
  // ui.container.addView(addEle);

  return {
    add: addEle,
    list,
  };
}

export { render };
