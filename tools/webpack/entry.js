const glob = require("glob");
const path = require("path");

const { projectsDir } = require("./constants");

function toPosixPath(v) {
  return v.split(path.sep).join(path.posix.sep);
}

function getEntry() {
  return glob.sync(projectsDir + "/**/project.json").reduce((result, p) => {
    const mainPath = p.replace(/project\.json$/, "main.ts");

    const key = toPosixPath(mainPath)
      .replace(toPosixPath(projectsDir) + path.posix.sep, "")
      .replace(/\.ts$/, "");

    result[key] = mainPath;
    return result;
  }, {});
}

module.exports = { getEntry };
