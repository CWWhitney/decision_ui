export const clampInRange = (value: number, range: [number, number]) => {
    return Math.max(range[0], Math.min(range[1], value));
};

export const extendRange = (value: number, range: [number, number]) => {
    return [Math.min(range[0], value), Math.max(range[1], value)] as [number, number];
};
