import * as tf from "@tensorflow/tfjs";

import { TypedTensor } from "../tensor";

export const toProbabilistic = (tt: TypedTensor, mcRuns: number): TypedTensor => {
    if (!tt.isProbabilistic) {
        if (!tt.isSeries) {
            // deterministic
            return {
                ...tt,
                tensor: tf.tile(tf.expandDims(tt.tensor, 0), [mcRuns]),
                isProbabilistic: true
            };
        } else {
            // deterministic series
            return {
                ...tt,
                tensor: tf.tile(tf.expandDims(tt.tensor, 0), [mcRuns, 1]),
                isProbabilistic: true
            };
        }
    }
    return tt;
};

export const toSeries = (tt: TypedTensor, n: number): TypedTensor => {
    if (!tt.isSeries) {
        if (!tt.isProbabilistic) {
            // deterministic
            return {
                ...tt,
                tensor: tf.tile(tf.expandDims(tt.tensor, 0), [n]),
                isSeries: true
            };
        } else {
            // probabilistic
            return {
                ...tt,
                tensor: tf.tile(tf.expandDims(tt.tensor, 1), [1, n]),
                isSeries: true
            };
        }
    }
    return tt;
};
