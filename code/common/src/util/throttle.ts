/* eslint @typescript-eslint/no-unsafe-function-type: 0 */

export const debounce = (fn: Function, ms = 300) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function (this: any, ...args: any[]) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), ms);
    };
};

export const throttle = (fn: Function, ms = 300) => {
    let isWaiting = false;
    return function (this: any, ...args: any[]) {
        if (isWaiting) {
            // skip calls while waiting
            return;
        }
        isWaiting = true;
        setTimeout(() => {
            isWaiting = false;
            fn.apply(this, args);
        }, ms);
    };
};
