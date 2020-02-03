function autoJsXmlLoader() {
  return `module.exports="__XML_TRANSFORM_BEGIN__${this.resourcePath}__XML_TRANSFORM_END__"`;
}

module.exports = autoJsXmlLoader;