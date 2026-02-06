import * as tf from "@tensorflow/tfjs";

import {
    deterministicSeriesToProbabilisticSeries,
    probabilisticTensorToProbabilisticSeries,
    scalarTensorToSeries
} from "./broadcast";

export const netPresentValue = ({
    mcRuns,
    seriesLength,
    x,
    discountRate,
    calculateNpv = true
}: {
    mcRuns: number;
    seriesLength: number;
    x: tf.Tensor;
    discountRate: tf.Tensor;
    calculateNpv?: boolean;
}): tf.Tensor => {
    const probabilistic = mcRuns > 0;

    const exponent = probabilistic
        ? deterministicSeriesToProbabilisticSeries(tf.range(0, seriesLength), mcRuns)
        : tf.range(0, seriesLength);

    const discountFactor = tf.div(1, tf.add(1, tf.div(discountRate, 100.0)));

    const base = probabilistic
        ? probabilisticTensorToProbabilisticSeries(discountFactor, seriesLength)
        : scalarTensorToSeries(discountFactor, seriesLength);

    const npvSeries = tf.mul(x, tf.pow(base, exponent));

    if (!calculateNpv) {
        return npvSeries;
    }

    return tf.sum(npvSeries, 1);
};
