export const transposeArray = <T>(array: T[][]) => {
    return array[0].map((_, idx) => array.map(row => row[idx]));
};
