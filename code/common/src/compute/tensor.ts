import { DeterministcType, ProbabilisticType, SeriesType } from "./value";

import * as tf from "@tensorflow/tfjs";

export interface TensorDescriptor {
    type: DeterministcType | ProbabilisticType | SeriesType;
    shape: [] | [number] | [number, number];
    dtype: string;
}

export interface TypedTensor extends tf.TensorContainerObject {
    tensor: tf.Tensor;
    isProbabilistic: boolean;
    isSeries: boolean;
}

export const getTypedTensorFromConstant = (t: tf.Tensor): TypedTensor => ({
    tensor: t,
    isProbabilistic: false,
    isSeries: false
});

export const getSeriesLengthFromTypedTensor = (tt: TypedTensor) => {
    if (!tt.isSeries) {
        throw new Error(`cannot determine series length for non-series tensor`);
    }

    if (tt.isProbabilistic) {
        if (tt.tensor.shape.length < 2) {
            throw new Error(`cannot determine series length for tensor with shape ${JSON.stringify(tt.tensor.shape)}`);
        }
        return tt.tensor.shape[1];
    }
    return tt.tensor.shape[0];
};

export const getSampleSizeFromTypedTensor = (tt: TypedTensor) => {
    if (!tt.isProbabilistic) {
        throw new Error(`cannot determine sample size for non-probabilistic tensor`);
    }

    if (tt.tensor.shape.length < 1) {
        throw new Error(`cannot determine sample size for tensor with shape ${JSON.stringify(tt.tensor.shape)}`);
    }
    return tt.tensor.shape[0];
};

export const getCommonSeriesLengthFromTypedTensors = (ttList: TypedTensor[]): number => {
    const seriesLengthSet = new Set<number>();
    for (const tt of ttList) {
        if (tt.isSeries) {
            seriesLengthSet.add(getSeriesLengthFromTypedTensor(tt));
        }
    }
    if (seriesLengthSet.size == 0) {
        throw new Error(`cannot determine common series length from tensors that are all not a series`);
    } else if (seriesLengthSet.size > 1) {
        throw new Error(`tensors have different series lengths ${JSON.stringify([...seriesLengthSet])}`);
    }
    return [...seriesLengthSet][0];
};
