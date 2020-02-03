function getUi<T>(key: string): T | undefined {
  const fun = UI_XML_MAP[key];

  if (fun) {
    return fun();
  }

  return undefined;
}

export { getUi };
