importClass(android.net.Uri);
importClass(android.provider.Settings);

function checkFloaty(): boolean {
  try {
    return Settings.canDrawOverlays(context);
  } catch (e) {
    return false;
  }
}

function openFloatySetting(applicationId = currentPackage()): void {
  const intent = new Intent(
    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
    Uri.parse(`package:${applicationId}`)
  );
  intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
  app.startActivity(intent);
}

export { checkFloaty, openFloatySetting };
