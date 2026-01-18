import { keep, onesLike, scalar, Tensor1D, topk, unsortedSegmentSum, type Tensor, tidy } from "@tensorflow/tfjs";

export interface HistogramData {
    bins: number[];
    counts: number[];
}

export const getHistogramBinsFromTensor = async (tensor: Tensor, numBins: number, lowerQ = 0.001, upperQ = 0.999) => {
    if (tensor.shape.length !== 1) {
        throw new Error("can only calculate histogram for probabilistic sample (Tensor1D)");
    }

    const { minTensor, maxTensor, countsTensor } = tidy(() => {
        const n = tensor.size;

        const loRank = Math.floor(lowerQ * n);
        const hiRank = Math.ceil(upperQ * n);

        const maxTensor = topk(keep(tensor), n - hiRank).values.min();
        const minTensor = topk(keep(tensor).neg(), loRank).values.min().neg();

        const range = maxTensor.sub(minTensor).maximum(scalar(1e-12));
        const binWidth = range.div(numBins);

        const indices = keep(tensor)
            .sub(minTensor)
            .div(binWidth)
            .floor()
            .toInt()
            .clipByValue(0, numBins - 1) as Tensor1D;

        const ones = onesLike(indices);
        const countsTensor = unsortedSegmentSum(ones, indices, numBins);
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
