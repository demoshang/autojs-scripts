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
  options = { method: 'GET' },
}: {
  url: string;
  key: string;
  options?: http.HttpRequestOptions;
}) {
  return new Promise<{
    body?: string;
    filePath: string;
  }>((rs, rj) => {
    http.request(url, options, (res, error) => {
      if (error) {
        rj(error);
        return;
      }

      const body = res.body.string();

      const filePath = getScriptPath(key);

      if (!files.exists(filePath)) {
        files.createWithDirs(filePath);
      }

      files.write(filePath, body, 'utf8');
      rs({ filePath });
    });
  });
}

export { downloadFile, getProjectDir, getThirdPartyDir, getScriptPath };
