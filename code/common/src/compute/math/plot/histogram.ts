import * as tf from "@tensorflow/tfjs";
import { scalarTensorToProbabilisitc } from "../broadcast";

export interface HistogramData {
    bins: number[];
    counts: number[];
}

export interface MultiHistogramData {
    bins: number[];
    counts: number[][];
}

export const getHistogramDataFromTensor = async (
    tensor: tf.Tensor,
    numBins: number,
    lowerQ = 0.001,
    upperQ = 0.999
): Promise<HistogramData> => {
    if (tensor.shape.length !== 1) {
        throw new Error("can only calculate histogram for probabilistic sample (Tensor1D)");
    }

    const { minTensor, maxTensor, countsTensor } = tf.tidy(() => {
        const n = tensor.size;

        // convert potential boolean tensor to numeric tensor
        const numericTensor = tf.keep(tensor).toFloat();

        const loRank = Math.ceil(lowerQ * n);
        const hiRank = Math.floor(upperQ * n);

        const maxTensor = tf.topk(numericTensor, n - hiRank).values.min();
        const minTensor = tf.topk(numericTensor.neg(), loRank).values.min().neg();

        const range = maxTensor.sub(minTensor).maximum(tf.scalar(1e-12));
        const binWidth = range.div(numBins);

        const indices = numericTensor
            .sub(minTensor)
            .div(binWidth)
            .floor()
            .toInt()
            .clipByValue(0, numBins - 1) as tf.Tensor1D;

        const ones = tf.onesLike(indices);
        const countsTensor = tf.unsortedSegmentSum(ones, indices, numBins);
        return {
            minTensor,
            maxTensor,
            countsTensor
        };
    });

    const min = (await minTensor.array()) as number;
    const max = (await maxTensor.array()) as number;
    const counts = (await countsTensor.array()) as number[];

    minTensor.dispose();
    maxTensor.dispose();
    countsTensor.dispose();

    const range = Math.max(max - min, 1e-12);
    const binWidth = range / numBins;

    const bins = Array.from({ length: numBins + 1 }, (_, i) => min + i * binWidth);

    return {
        bins,
        counts
    };
};

export const getMultiHistogramDataFromTensors = async (
    tensors: tf.Tensor[],
    numBins: number,
    lowerQ = 0.001,
    upperQ = 0.999
): Promise<MultiHistogramData> => {
    if (tensors.length == 0) {
        throw new Error("cannot calculate multi histogram data for empty list of tensors");
    }

    const mcRuns = tensors.reduce((p, t) => Math.max(p, t.shape[0] ?? 1), 1);

    for (const t of tensors) {
        if (t.shape.length > 1) {
            throw new Error("can only calculate multi histogram for 1d tensors or scalars");
        }
        if (t.shape.length == 1 && t.shape[0] != mcRuns) {
            throw new Error("can only calculate multi histogram for 1d tensors with the same length");
        }
    }

    const { minTensor, maxTensor, countsTensors } = tf.tidy(() => {
        // upcast tensors to make all probabilisitic
        const probabilisticTensors = tensors
            .map(t => (t.shape.length == 0 ? scalarTensorToProbabilisitc(tf.keep(t), mcRuns) : tf.keep(t)))
            .map(t => t.toFloat());

        // caluclate combined bins
        const combinedTensor = tf.concat(probabilisticTensors);
        const combinedLength = combinedTensor.size;

        const loRank = Math.ceil(lowerQ * combinedLength);
        const hiRank = Math.floor(upperQ * combinedLength);

        const maxTensor = tf.topk(combinedTensor, combinedLength - hiRank).values.min();
        const minTensor = tf.topk(combinedTensor.neg(), loRank).values.min().neg();

        const range = maxTensor.sub(minTensor).maximum(tf.scalar(1e-12));
        const binWidth = range.div(numBins);

        const countsTensors: tf.Tensor[] = [];
        for (const probabilisiticTensor of probabilisticTensors) {
            const indices = probabilisiticTensor
                .sub(minTensor)
                .div(binWidth)
                .floor()
                .toInt()
                .clipByValue(0, numBins - 1) as tf.Tensor1D;

            const ones = tf.onesLike(indices);
            const countsTensor = tf.unsortedSegmentSum(ones, indices, numBins);
            countsTensors.push(countsTensor);
        }

        return {
            minTensor,
            maxTensor,
            countsTensors
        };
    });

    const min = (await minTensor.array()) as number;
    const max = (await maxTensor.array()) as number;
    const counts = (await Promise.all(countsTensors.map(t => t.array()))) as number[][];

    minTensor.dispose();
    maxTensor.dispose();

    for (const t of countsTensors) {
        t.dispose();
    }

    const range = Math.max(max - min, 1e-12);
    const binWidth = range / numBins;

    const bins = Array.from({ length: numBins + 1 }, (_, i) => min + i * binWidth);

    return {
        bins,
        counts
    };
};
