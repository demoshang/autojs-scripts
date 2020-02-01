const glob = require('glob');

const { projectsDir } = require('./constants');

function getEntry() {
  return glob.sync(projectsDir + '/**/task.ts').reduce((result, p) => {
    const key = p.replace(projectsDir + '/', '').replace('/task.ts', '');
    result[key + '/task'] = p;
    result[key + '/main'] = p.replace('/task.ts', '/main.ts');
    return result;
  }, {});
}

module.exports = { getEntry };
