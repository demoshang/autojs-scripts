declare class Uri {
  static parse(v: string): string;
}

declare class Settings {
  static ACTION_MANAGE_OVERLAY_PERMISSION: string;

  static canDrawOverlays(context: any): boolean;
}

declare class AudioManager {
  static STREAM_MUSIC: number;
  static ADJUST_UNMUTE: number;
  static ADJUST_MUTE: number;

  isStreamMute(streamType: number): boolean;
  adjustStreamVolume(streamType: number, direction: number, flags: number): void;
}

declare class Context {
  static AUDIO_SERVICE: string;

  startActivity(intent: any): void;
  getResources(): any;
  getSystemService(v: string): AudioManager;
}

declare class View {
  static VISIBLE: string;
  static GONE: string;
}

interface AndroidClass {
  net: {
    Uri: Uri;
  };
  provider: {
    Settings: Settings;
  };
  content: {
    Context: Context;
    Intent: Intent;
  };
  media: {
    AudioManager: AudioManager;
  };
  [key: string]: any
}

declare class Intent {
  static FLAG_ACTIVITY_NEW_TASK: number;

  static parseUri(uri: string, flags: number): Intent;

  constructor(setting: string, uri: string);

  addFlags(flag: number): void;

}

declare const context: Context;
declare const android: AndroidClass;
declare function importClass(clazz: any): void;
