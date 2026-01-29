export const roundToSignificant = (value: number, precision = 3) => {
    return Number(value.toPrecision(precision));
};

export const numberToPrettyString = (value: number, precision = 3) => {
    if (value == null) return "undefined";
    value = value as number;
    /*const approximatelyEqual = (v1: number, v2: number) => Math.abs(v1 - v2) < epsilon;
    return approximatelyEqual(value, 0) ? 0 : value.toFixed(Math.max(0, precision - Math.floor(Math.log10(value))));*/
    return `${roundToSignificant(value, precision)}`;
};
