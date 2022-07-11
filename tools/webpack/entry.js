const glob = require("glob");
const path = require("path");

const { projectsDir } = require("./constants");

function toPosixPath(v) {
  return v.split(path.sep).join(path.posix.sep);
}

function getKey(p) {
  return toPosixPath(p)
    .replace(toPosixPath(projectsDir) + path.posix.sep, "")
    .replace(/\.ts$/, "");
}

function getEntry() {
  return glob.sync(projectsDir + "/**/project.json").reduce((result, p) => {
    const mainPath = p.replace(/project\.json$/, "main.ts");

    const key = getKey(mainPath);

    result[key] = mainPath;

    const entries = require(p).entries || [];

    entries.forEach((entryPath) => {
      const fullPath = path.resolve(mainPath, "../", entryPath);
      const key = getKey(fullPath);

      result[key] = fullPath;
    });

    return result;
  }, {});
}

module.exports = { getEntry };
