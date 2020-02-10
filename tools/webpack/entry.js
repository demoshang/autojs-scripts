const glob = require('glob');

const { projectsDir } = require('./constants');

function getEntry() {
  return glob.sync(projectsDir + '/**/project.json').reduce((result, p) => {
    const mainPath = p.replace(/project\.json$/, 'main.ts')
    const key = mainPath.replace(projectsDir + '/', '').replace(/\.ts$/, '');
    result[key] = mainPath;
    return result;
  }, {});
}

module.exports = { getEntry };
