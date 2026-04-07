export const sleep = async (time: number) => {
    return new Promise<void>(resolve => {
        setTimeout(() => {
            resolve();
        }, time);
    });
};
