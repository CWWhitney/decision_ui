import * as tf from "@tensorflow/tfjs";

export interface HistogramData {
    bins: number[];
    counts: number[];
}

export const getHistogramBinsFromTensor = async (
    tensor: tf.Tensor,
    numBins: number,
    lowerQ = 0.001,
    upperQ = 0.999
) => {
    if (tensor.shape.length !== 1) {
        throw new Error("can only calculate histogram for probabilistic sample (Tensor1D)");
    }

    const { minTensor, maxTensor, countsTensor } = tf.tidy(() => {
        const n = tensor.size;

        const loRank = Math.floor(lowerQ * n);
        const hiRank = Math.ceil(upperQ * n);

        const maxTensor = tf.topk(tf.keep(tensor), n - hiRank).values.min();
        const minTensor = tf.topk(tf.keep(tensor).neg(), loRank).values.min().neg();

        const range = maxTensor.sub(minTensor).maximum(tf.scalar(1e-12));
        const binWidth = range.div(numBins);

        const indices = tf
            .keep(tensor)
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
