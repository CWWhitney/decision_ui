import * as tf from "@tensorflow/tfjs";

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
    varMean: tf.Tensor;
    varCv: tf.Tensor;
    n: tf.Tensor;
    distribution: string;
    absoluteTrend: tf.Tensor | null;
    relativeTrend: tf.Tensor | null;
    lowerLimit: tf.Tensor | null;
    upperLimit: tf.Tensor | null;
}) => {
    if (n.shape.length != 0) {
        throw new Error("valueVarier parameter 'n' needs to be a number");
    }
    const nValue = n.arraySync() as number;
    if (Math.ceil(nValue) != nValue) {
        throw new Error("valueVarier parameter 'n' needs to be an integer");
    }
    if (nValue <= 1) {
        throw new Error("valueVarier parameter 'n' needs to be larger than 1");
    }
    if (distribution != "normal") {
        throw new Error("valueVarier only supports 'normal' distrubtion");
    }
    if (varMean.shape.length > 1) {
        throw new Error("valueVarier varMean can only be a constant or sample");
    }
    if (varCv.shape.length > 1) {
        throw new Error("valueVarier varCv can only be a constant or sample");
    }
    if (lowerLimit && lowerLimit.shape.length > 0) {
        throw new Error("valueVarier lowerLimit can only be a constant");
    }
    if (upperLimit && upperLimit.shape.length > 0) {
        throw new Error("valueVarier upperLimit can only be a constant");
    }

    const meansSample = varMean.shape.length == 0 ? tf.tile(tf.expandDims(varMean, -1), [mcRuns]) : varMean;
    const meansSeries = tf.tile(tf.expandDims(meansSample, -1), [1, nValue]);

    const cvSample = varCv.shape.length == 0 ? tf.tile(tf.expandDims(varCv, -1), [mcRuns]) : varCv;
    const cvSeries = tf.tile(tf.expandDims(cvSample, -1), [1, nValue]);

    let annualMeansSeries: tf.Tensor = meansSeries;
    if (absoluteTrend != null) {
        // absolute trend
        annualMeansSeries = tf.add(annualMeansSeries, tf.mul(absoluteTrend, tf.range(0, nValue)));
    }
    if (relativeTrend != null) {
        // relative trend
        const exponent = tf.range(0, nValue);
        const base = tf.add(1, tf.div(relativeTrend, 100.0));
        annualMeansSeries = tf.mul(annualMeansSeries, tf.pow(base, exponent));
    }

    const annualVarsSeries = tf.abs(tf.mul(annualMeansSeries, tf.div(cvSeries, 100)));
    const epsilon = tf.randomNormal([mcRuns, nValue], 0, 1);

    let vvSeries = tf.add(annualMeansSeries, tf.mul(annualVarsSeries, epsilon));
    console.log(`vv means`, tf.mean(vvSeries, 0).arraySync());
    console.log(`vv stddev`, tf.sqrt(tf.mean(tf.square(tf.sub(vvSeries, tf.mean(vvSeries, 0, true))), 0)).arraySync());

    if (lowerLimit != null) {
        vvSeries = tf.maximum(vvSeries, lowerLimit);
    }
    if (upperLimit != null) {
        vvSeries = tf.minimum(vvSeries, upperLimit);
    }

    return vvSeries;
};
