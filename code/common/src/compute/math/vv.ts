import * as tf from "@tensorflow/tfjs";
import { TypedTensor } from "../tensor";

export const valueVarier = ({
    mcRuns,
    varMean,
    varCv,
    n,
    distribution = "normal",
    absoluteTrend = null,
    relativeTrend = null,
    lowerLimit = null,
    upperLimit = null
}: {
    mcRuns: number;
    varMean: TypedTensor;
    varCv: TypedTensor;
    n: TypedTensor;
    distribution?: string;
    absoluteTrend?: TypedTensor | null;
    relativeTrend?: TypedTensor | null;
    lowerLimit?: TypedTensor | null;
    upperLimit?: TypedTensor | null;
}): TypedTensor => {
    if (n.isProbabilistic || n.isSeries || n.tensor.shape.length != 0) {
        throw new Error("valueVarier parameter 'n' needs to be a deterministic number");
    }
    const nValue = n.tensor.arraySync() as number;
    if (Math.ceil(nValue) != nValue) {
        throw new Error("valueVarier parameter 'n' needs to be an integer");
    }
    if (nValue <= 1) {
        throw new Error("valueVarier parameter 'n' needs to be larger than 1");
    }
    if (distribution != "normal") {
        throw new Error("valueVarier only supports 'normal' distrubtion");
    }
    if (varMean.isSeries) {
        throw new Error("valueVarier varMean can only be a constant or sample");
    }
    if (varCv.isSeries) {
        throw new Error("valueVarier varCv can only be a constant or sample");
    }
    if (lowerLimit && (lowerLimit.isProbabilistic || lowerLimit.isSeries || lowerLimit.tensor.shape.length != 0)) {
        throw new Error("valueVarier lowerLimit can only be a deterministic number");
    }
    if (upperLimit && (upperLimit.isProbabilistic || upperLimit.isSeries || upperLimit.tensor.shape.length != 0)) {
        throw new Error("valueVarier upperLimit can only be a deterministic number");
    }

    const varMeanT = varMean.tensor;
    const meansSampleT = varMeanT.shape.length == 0 ? tf.tile(tf.expandDims(varMeanT, -1), [mcRuns]) : varMeanT;
    const meansSeriesT = tf.tile(tf.expandDims(meansSampleT, -1), [1, nValue]);

    const varCvT = varCv.tensor;
    const cvSampleT = varCvT.shape.length == 0 ? tf.tile(tf.expandDims(varCvT, -1), [mcRuns]) : varCvT;
    const cvSeriesT = tf.tile(tf.expandDims(cvSampleT, -1), [1, nValue]);

    let annualMeansSeries: tf.Tensor = meansSeriesT;
    if (absoluteTrend != null) {
        // absolute trend
        annualMeansSeries = tf.add(annualMeansSeries, tf.mul(absoluteTrend.tensor, tf.range(0, nValue)));
    }
    if (relativeTrend != null) {
        // relative trend
        const exponent = tf.range(0, nValue);
        const base = tf.add(1, tf.div(relativeTrend.tensor, 100.0));
        annualMeansSeries = tf.mul(annualMeansSeries, tf.pow(base, exponent));
    }

    const annualVarsSeries = tf.abs(tf.mul(annualMeansSeries, tf.div(cvSeriesT, 100)));
    const epsilon = tf.randomNormal([mcRuns, nValue], 0, 1);

    let vvSeries = tf.add(annualMeansSeries, tf.mul(annualVarsSeries, epsilon));
    console.log(`vv means`, tf.mean(vvSeries, 0).arraySync());
    console.log(`vv stddev`, tf.sqrt(tf.mean(tf.square(tf.sub(vvSeries, tf.mean(vvSeries, 0, true))), 0)).arraySync());

    if (lowerLimit != null) {
        vvSeries = tf.maximum(vvSeries, lowerLimit.tensor);
    }
    if (upperLimit != null) {
        vvSeries = tf.minimum(vvSeries, upperLimit.tensor);
    }

    return {
        tensor: vvSeries,
        isProbabilistic: true,
        isSeries: true
    };
};
