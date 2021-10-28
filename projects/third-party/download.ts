const getProjectDir = (() => {
  const project = files.path(`../`);

  return () => {
    return project;
  };
})();

const getThirdPartyDir = (() => {
  const dir = files.join(getProjectDir(), 'thirdParty/');

  return () => {
    return dir;
  };
})();

function getScriptPath(key: string) {
  return files.join(getThirdPartyDir(), `${key}.js`);
}

function downloadFile({
  url,
  key,
  callback = () => {},
  options = { method: 'GET' },
}: {
  url: string;
  key: string;
  options?: http.HttpRequestOptions;
  callback: (
    error: Error | null,
    res: http.Response,
    filePath?: string,
  ) => void;
}) {
  http.request(url, options, (res, error) => {
    if (error) {
      callback(error, res);
      return;
    }

    const body = res.body.string();

    const filePath = getScriptPath(key);

    if (!files.exists(filePath)) {
      files.createWithDirs(filePath);
    }

    files.write(filePath, body, 'utf8');
    callback(null, res, filePath);
  });
}

export { downloadFile, getProjectDir, getThirdPartyDir, getScriptPath };
