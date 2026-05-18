export const getFromMapOrThrow = <K, V>(key: K, map: Map<K, V>) => {
    const value = map.get(key);
    if (value === undefined) {
        throw new Error(`could not find key '${key}' in map`);
    }
    return value;
};

export const fromEntriesGrouped = <K extends PropertyKey, V>(entries: Iterable<readonly [K, V]>): Record<K, V[]> => {
    const result = {} as Record<K, V[]>;

    for (const [key, value] of entries) {
        (result[key] ??= []).push(value);
    }

    return result;
};
