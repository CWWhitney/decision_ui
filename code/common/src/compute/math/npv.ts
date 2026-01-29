import * as tf from "@tensorflow/tfjs";

export const netPresentValue = (x: tf.Tensor, discount: tf.Tensor) => {
    if (x.shape.length != 2) {
        throw new Error(
            `function 'npv' expects a time series as first parameter, but has shape ${JSON.stringify(x.shape)}`
        );
    }
    if (discount.shape.length != 0) {
        throw new Error(
            `function 'npv' expects a number as second parameter, but has shape ${JSON.stringify(discount.shape)}`
        );
    }
    const exponent = tf.range(0, x.shape[x.shape.length - 1]);
    const base = tf.div(1, tf.add(1, tf.div(discount, 100.0)));
    return tf.sum(tf.mul(x, tf.pow(base, exponent)), 1);
};
