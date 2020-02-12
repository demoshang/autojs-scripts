
interface IUri {
  parse(v: string): void;
}

interface ISettings {
  canDrawOverlays(context: any): boolean;
  ACTION_MANAGE_OVERLAY_PERMISSION: string;
}

interface AndroidClass {
  net: {
    Uri: IUri;
  };
  provider: {
    Settings: ISettings;
  };
}

declare const Intent: any;
declare const Uri: IUri;
declare const Settings: ISettings;

declare const android: AndroidClass;
declare function importClass(clazz: any): void;
