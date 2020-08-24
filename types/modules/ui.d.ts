// interface View {
//     w: 'auto' | '*' | number;
//     h: 'auto' | '*' | number;
//     id: string;
//     gravity: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'center_vertical' | 'center_horizontal' | string;
//     layout_gravity: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'center_vertical' | 'center_horizontal' | string;
//     margin: number | string;
//     marginLeft: number;
//     marginRight: number;
//     marginTop: number;
//     marginBottom: number;
//     padding
//     paddingLeft: number;
//     paddingRight: number;
//     paddingTop: number;
//     paddingBottom: number;
//     bg
//     alpha
//     foreground
//     minHeight
//     minWidth
//     visbility
//     rotation
//     transformPivotX
//     transformPivotY
//     style
// }

// interface UI {
//     [id: string]: View | ((...args: any[]) => any);
//     layout(xml: any): void;
//     inflate(xml: any, parent?: View): void;
//     findView(id: string): View;
//     finish()
//     setContentView(view: View)
//     run(callback)
//     post(callback, delay?: number): void;
//     statusBarColor(color)
//     showPopupMenu(view, menu)
// }

// declare const ui: UI;

// type View = any;

interface UILike {
    toString(): string;
}

interface Ui {  
    layout(xml: UILike | any): void;
    inflate(xml: UILike | any, parent?: View): void;
    findView(id: string): View;
    finish(): void;
    setContentView(view: View): void;
    run(callback: Function): void;
    post(callback: Function, delay?: number): void;
    statusBarColor(color: any): void;
    showPopupMenu(view: View, menu: any): void;

    emitter: EventEmitter;
    [key: string]: UiObject;
}

declare const ui: Ui;