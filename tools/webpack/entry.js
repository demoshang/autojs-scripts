const glob = require('glob');

const { projectsDir } = require('./constants');

function getEntry() {
  return glob.sync(projectsDir + '/**/main.ts').reduce((result, p) => {
    const key = p.replace(projectsDir + '/', '').replace(/\.ts$/, '');
    result[key] = p;
    return result;
  }, {});
}

module.exports = { getEntry };
