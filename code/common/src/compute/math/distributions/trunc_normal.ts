/*
Many thanks to Christoph Pahmeyer (chrispahm.github.io)
and Tom Liao.

See https://observablehq.com/@chrispahm/skew-normal-distributions
for further information.
*/

import { getNormalDistributionParameter } from "./normal";
import { validateLowerUpperBounds } from "./validate";

const random_trunc_normal = ({
    rng = Math.random,
    range = [-Infinity, Infinity],
    mean,
    stddev,
    skew = 0
}: {
    rng?: typeof Math.random;
    range?: [number, number];
    mean: number;
    stddev: number;
    skew?: number;
}): number => {
    // Before we start, we need to make sure the mean value is actually
    // within our desired range
    if (mean < range[0] || mean > range[1]) {
        throw Error(`Mean of ${mean} not in desired range of ${range}!`);
    }

    // Box-Muller transform
    function randomNormals(rng: typeof Math.random) {
        let u1 = 0,
            u2 = 0;
        //Convert [0,1) to (0,1)
        while (u1 === 0) u1 = rng();
        while (u2 === 0) u2 = rng();
        const R = Math.sqrt(-2.0 * Math.log(u1));
        const Θ = 2.0 * Math.PI * u2;
        return [R * Math.cos(Θ), R * Math.sin(Θ)];
    }

    // Skew-normal transform
    // If a variate is either below or above the desired range,
    // we recursively call the randomSkewNormal function until
    // a value within the desired range is drawn
    function randomSkewNormal(rng: typeof Math.random, mean: number, stddev: number, skew = 0): number {
        const [u0, v] = randomNormals(rng);
        if (skew === 0) {
            const value = mean + stddev * u0;
            if (value < range[0] || value > range[1]) return randomSkewNormal(rng, mean, stddev, skew);
            return value;
        }
        const sig = skew / Math.sqrt(1 + skew * skew);
        const u1 = sig * u0 + Math.sqrt(1 - sig * sig) * v;
        const z = u0 >= 0 ? u1 : -u1;
        const value = mean + stddev * z;
        if (value < range[0] || value > range[1]) return randomSkewNormal(rng, mean, stddev, skew);
        return value;
    }

    return randomSkewNormal(rng, mean, stddev, skew);
};

export const validatePositiveNormalDistributionParameters = (lower: number, upper: number) => {
    validateLowerUpperBounds(lower, upper);

    if (lower <= 0) {
        throw new Error(`Lower bound '${lower}' needs to be larger than 0.`);
    }
    if (upper < 0) {
        throw new Error(`Upper bound '${upper}' needs to be larger than 0.`);
    }
    if (!(lower >= upper * 0.1)) {
        throw new Error(`Lower bound '${lower}' needs to be at least 1/10th of the upper bound '${upper}'.`);
    }
    return true;
};

export const getPositiveNormalDistributionSample = (lower: number, upper: number, size: number) => {
    const { mean, stddev } = getNormalDistributionParameter(lower, upper);
    return [...Array(size).keys()].map(() => random_trunc_normal({ range: [0, Infinity], mean, stddev }));
};

export const validate01TruncatedNormalDistributionParameters = (lower: number, upper: number) => {
    validateLowerUpperBounds(lower, upper);

    if (lower <= 0) {
        throw new Error(`Lower bound '${lower}' needs to be larger than 0.`);
    }
    if (upper < 0) {
        throw new Error(`Upper bound '${upper}' needs to be larger than 0.`);
    }
    if (!(lower >= upper * 0.1)) {
        throw new Error(`Lower bound '${lower}' needs to be at least 1/10th of the upper bound '${upper}'.`);
    }
    if (lower < 0 || lower > 1) {
        throw new Error(`Lower bound '${lower}' needs to be between 0 and 1.`);
    }
    if (upper < 0 || upper > 1) {
        throw new Error(`Upper bound '${upper}' needs to be between 0 and 1.`);
    }
    if (!(lower + (1 - lower) * 0.9 >= upper)) {
        throw new Error(`Lower bound '${lower}' and upper bound '${upper}' need to be closer.`);
    }
    return true;
};

export const get01TruncatedNormalDistributionSample = (lower: number, upper: number, size: number) => {
    const { mean, stddev } = getNormalDistributionParameter(lower, upper);
    return [...Array(size).keys()].map(() => random_trunc_normal({ range: [0, 1], mean, stddev }));
};
