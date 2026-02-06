import * as tf from "@tensorflow/tfjs";
import {
    deterministicSeriesToProbabilisticSeries,
    probabilisticTensorToProbabilisticSeries,
    scalarTensorToSeries
} from "./broadcast";

export const probabilisticValuerVarier = ({
    mcRuns,
    n,
    varMean,
    varCv,
    absoluteTrend = null,
    relativeTrend = null,
    lowerLimit = null,
    upperLimit = null
}: {
    mcRuns: number;
    n: number;
    varMean: tf.Tensor;
    varCv: tf.Tensor;
    absoluteTrend?: tf.Tensor;
    relativeTrend?: tf.Tensor;
    lowerLimit?: tf.Tensor;
    upperLimit?: tf.Tensor;
}) => {
    const varMeanSeries = probabilisticTensorToProbabilisticSeries(varMean, n);
    const varCvSeries = probabilisticTensorToProbabilisticSeries(varCv, n);

    let annualMeansSeries: tf.Tensor = varMeanSeries;
    if (absoluteTrend != null && relativeTrend == null) {
        // absolute trend
        const timeSeries = deterministicSeriesToProbabilisticSeries(tf.range(0, n), mcRuns);
        const absoluteTrendSeries = probabilisticTensorToProbabilisticSeries(absoluteTrend, n);
        annualMeansSeries = tf.add(annualMeansSeries, tf.mul(absoluteTrendSeries, timeSeries));
    }
    if (relativeTrend != null && absoluteTrend == null) {
        // relative trend
        const exponent = deterministicSeriesToProbabilisticSeries(tf.range(0, n), mcRuns);
        const relativeTrendSeries = probabilisticTensorToProbabilisticSeries(relativeTrend, n);
        const base = tf.add(1, tf.div(relativeTrendSeries, 100.0));
        annualMeansSeries = tf.mul(annualMeansSeries, tf.pow(base, exponent));
    }

    const annualVarsSeries = tf.abs(tf.mul(annualMeansSeries, tf.div(varCvSeries, 100)));
    const epsilon = tf.randomNormal([mcRuns, n], 0, 1);

    let vvSeries = tf.add(annualMeansSeries, tf.mul(annualVarsSeries, epsilon));

    if (lowerLimit != null) {
        const lowerLimitSeries = probabilisticTensorToProbabilisticSeries(lowerLimit, n);
        vvSeries = tf.maximum(vvSeries, lowerLimitSeries);
    }
    if (upperLimit != null) {
        const upperLimitSeries = probabilisticTensorToProbabilisticSeries(upperLimit, n);
        vvSeries = tf.minimum(vvSeries, upperLimitSeries);
    }

    return vvSeries;
};

export const deterministicValuerVarier = ({
    n,
    varMean,
    varCv,
    absoluteTrend = null,
    relativeTrend = null,
    lowerLimit = null,
    upperLimit = null
}: {
    n: number;
    varMean: tf.Tensor | number;
    varCv: tf.Tensor | number;
    absoluteTrend?: tf.Tensor | number;
    relativeTrend?: tf.Tensor | number;
    lowerLimit?: tf.Tensor | number;
    upperLimit?: tf.Tensor | number;
}) => {
    const varMeanSeries = scalarTensorToSeries(varMean, n);
    const varCvSeries = scalarTensorToSeries(varCv, n);

    let annualMeansSeries: tf.Tensor = varMeanSeries;
    if (absoluteTrend != null && relativeTrend == null) {
        // absolute trend
        annualMeansSeries = tf.add(annualMeansSeries, tf.mul(absoluteTrend, tf.range(0, n)));
    }
    if (relativeTrend != null && absoluteTrend == null) {
        // relative trend
        const exponent = tf.range(0, n);
        const base = tf.add(1, tf.div(relativeTrend, 100.0));
        annualMeansSeries = tf.mul(annualMeansSeries, tf.pow(base, exponent));
    }

    const annualVarsSeries = tf.abs(tf.mul(annualMeansSeries, tf.div(varCvSeries, 100)));
    const epsilon = tf.randomNormal([n], 0, 1);

    let vvSeries = tf.add(annualMeansSeries, tf.mul(annualVarsSeries, epsilon));

    if (lowerLimit != null) {
        vvSeries = tf.maximum(vvSeries, lowerLimit);
    }
    if (upperLimit != null) {
        vvSeries = tf.minimum(vvSeries, upperLimit);
    }

    return vvSeries;
};
