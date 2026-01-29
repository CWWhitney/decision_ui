import * as tf from "@tensorflow/tfjs";
import { getSeriesLengthFromTypedTensor, TypedTensor } from "../tensor";

export const netPresentValue = (x: TypedTensor, discount: TypedTensor): TypedTensor => {
    if (!x.isSeries) {
        throw new Error(`function 'npv' expects a time series as first parameter`);
    }
    if (discount.isProbabilistic) {
        throw new Error(`function 'npv' expects a deterministc discount parameter`);
    }
    if (discount.tensor.shape.length != 0) {
        throw new Error(
            `function 'npv' expects a number as second parameter, ` +
                `but got a tensor of shape ${JSON.stringify(discount.tensor.shape)}`
        );
    }
    const exponent = tf.range(0, getSeriesLengthFromTypedTensor(x));
    const base = tf.div(1, tf.add(1, tf.div(discount.tensor, 100.0)));
    return {
        tensor: tf.sum(tf.mul(x.tensor, tf.pow(base, exponent)), 1),
        isProbabilistic: x.isProbabilistic,
        isSeries: false
    };
};
