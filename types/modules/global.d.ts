interface Point {
    x: number;
    y: number;
}

declare function sleep(n: number): void;

declare function currentPackage(): string;

declare function currentActivity(): string;

declare function setClip(test: string): void;

declare function getClip(): string;

declare function toast(message: string): void;

declare function toastLog(message: string): void;

declare function waitForActivity(activity: string, period?: number): void;

declare function waitForPackage(packageName: string, period?: number): void;

declare function exit(): void;

declare function random(): number;
declare function random(min: number, max: number): number;

declare function text(str: string): UiSelector;
declare function textContains(str: string): UiSelector;
declare function textStartsWith(prefix: string): UiSelector;
declare function textEndsWith(suffix: string): UiSelector;
declare function textMatches(reg: string | RegExp): UiSelector;
declare function desc(str: string): UiSelector;
declare function descContains(str: string): UiSelector;
declare function descStartsWith(prefix: string): UiSelector;
declare function descEndsWith(suffix: string): UiSelector;
declare function descMatches(reg: string | RegExp): UiSelector;
declare function id(resId: string): UiSelector;
declare function idContains(str: string): UiSelector;
declare function idStartsWith(prefix: string): UiSelector;
declare function idEndsWith(suffix: string): UiSelector;
declare function idMatches(reg: string | RegExp): UiSelector;
declare function className(str: string): UiSelector;
declare function classNameContains(str: string): UiSelector;
declare function classNameStartsWith(prefix: string): UiSelector;
declare function classNameEndsWith(suffix: string): UiSelector;
declare function classNameMatches(reg: string | RegExp): UiSelector;

