const path = require("path");

function autoJsXmlLoader() {
  return `module.exports="__XML_TRANSFORM_BEGIN__${this.resourcePath
    .split(path.sep)
    .join(path.posix.sep)}__XML_TRANSFORM_END__"`;
}

module.exports = autoJsXmlLoader;
