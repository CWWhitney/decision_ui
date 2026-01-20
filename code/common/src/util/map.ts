export const getFromMapOrThrow = <K, V>(key: K, map: Map<K, V>) => {
    const value = map.get(key);
    if (!value) {
        throw new Error(`could not find key '${key}' in map`);
    }
    return value;
};
