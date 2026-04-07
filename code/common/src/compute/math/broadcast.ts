import * as tf from "@tensorflow/tfjs";

import { TypedTensor } from "../tensor";

export const scalarTensorToProbabilisitc = (t: tf.Tensor | number, mcRuns: number): tf.Tensor => {
    return tf.tile(tf.expandDims(t, 0), [mcRuns]);
};

export const scalarTensorToSeries = (t: tf.Tensor | number, n: number): tf.Tensor => {
    return tf.tile(tf.expandDims(t, 0), [n]);
};

export const probabilisticTensorToProbabilisticSeries = (t: tf.Tensor, n: number): tf.Tensor => {
    return tf.tile(tf.expandDims(t, 1), [1, n]);
};

export const deterministicSeriesToProbabilisticSeries = (t: tf.Tensor, mcRuns: number): tf.Tensor => {
    return tf.tile(tf.expandDims(t, 0), [mcRuns, 1]);
};

export const ttToProbabilistic = <T extends TypedTensor>(tt: T, mcRuns: number): T => {
    if (!tt.isProbabilistic) {
        if (!tt.isSeries) {
            // deterministic
            return {
                ...tt,
                tensor: scalarTensorToProbabilisitc(tt.tensor, mcRuns),
                isProbabilistic: true
            };
        } else {
            // deterministic series
            return {
                ...tt,
                tensor: deterministicSeriesToProbabilisticSeries(tt.tensor, mcRuns),
                isProbabilistic: true
            };
        }
    }
    return tt;
};

export const ttToSeries = <T extends TypedTensor>(tt: T, n: number): T => {
    if (!tt.isSeries) {
        if (!tt.isProbabilistic) {
            // deterministic
            return {
                ...tt,
                tensor: scalarTensorToSeries(tt.tensor, n),
                isSeries: true
            };
        } else {
            // probabilistic
            return {
                ...tt,
                tensor: probabilisticTensorToProbabilisticSeries(tt.tensor, n),
                isSeries: true
            };
        }
    }
    return tt;
};
