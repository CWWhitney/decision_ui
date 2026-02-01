import * as tf from "@tensorflow/tfjs";
import { getSampleSizeFromTypedTensor, getSeriesLengthFromTypedTensor, TypedTensor } from "../tensor";

export const netPresentValue = (x: TypedTensor, discount: TypedTensor): TypedTensor => {
    if (!x.isSeries) {
        throw new Error(`function 'npv' expects a time series as first parameter`);
    }
    if (discount.isSeries) {
        throw new Error(`discount rate may not be a series value`);
    }
    const seriesLength = getSeriesLengthFromTypedTensor(x);

    let exponent: tf.Tensor = tf.range(0, seriesLength);
    let base: tf.Tensor = tf.div(1, tf.add(1, tf.div(discount.tensor, 100.0)));

    // broadcast exponent and base
    if (x.isProbabilistic || discount.isProbabilistic) {
        const mcRuns = x.isProbabilistic ? getSampleSizeFromTypedTensor(x) : getSampleSizeFromTypedTensor(discount);
        exponent = tf.tile(tf.expandDims(exponent, 0), [mcRuns, 1]);
        base = tf.tile(tf.expandDims(base, 1), [1, seriesLength]);
    } else {
        base = tf.tile(tf.expandDims(base, 0), [seriesLength]);
    }

    return {
        tensor: tf.sum(tf.mul(x.tensor, tf.pow(base, exponent)), 1),
        isProbabilistic: x.isProbabilistic,
        isSeries: false
    };
};
