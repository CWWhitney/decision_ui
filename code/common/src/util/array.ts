export const transposeArray = <T>(array: T[][]) => {
    return array[0].map((_, idx) => array.map(row => row[idx]));
};

/**
 * Return items which non-unique property values defined by selector.
 *
 * @param items the list of items
 * @param selector the selector that defines which property to check for uniqueness
 * @returns items that have duplicates property values
 */
export const findDuplicatesBy = <T, K>(items: T[], selector: (item: T) => K): T[] => {
    const counts = new Map<K, number>();

    for (const item of items) {
        const key = selector(item);
        counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return items.filter(item => {
        const key = selector(item);
        return (counts.get(key) ?? 0) > 1;
    });
};
