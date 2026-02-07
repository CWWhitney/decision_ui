import * as tf from "@tensorflow/tfjs";

export interface ProbabilisticSeriesPlotData {
    means: number[];
    stddevs: number[];
}

export interface DeterministicSeriesPlotData {
    values: number[];
}

export interface BoxPlotPoint {
    min: number;
    max: number;
    median: number;
    mean: number;
    q1: number;
    q3: number;
}

export const getProbabilisticSeriesPlotDataFromTensor = async (
    tensor: tf.Tensor
): Promise<ProbabilisticSeriesPlotData> => {
    const started = +new Date();
    const { meansTensor, stddevsTensor } = tf.tidy(() => {
        const { mean: meansTensor, variance: varianceTensor } = tf.moments(tf.keep(tensor), 0);
        const stddevsTensor = varianceTensor.sqrt();
        return { meansTensor, stddevsTensor };
    });

    const means = (await meansTensor.array()) as number[];
    const stddevs = (await stddevsTensor.array()) as number[];

    meansTensor.dispose();
    stddevsTensor.dispose();

    console.log(`series plot data in ${+new Date() - started}ms`);

    return { means, stddevs };
};

export const getProbabilisticSeriesBoxPlotDataFromTensor = async (tensor: tf.Tensor): Promise<BoxPlotPoint[]> => {
    const started = +new Date();

    const { minTensor, maxTensor, medianTensor, meanTensor, q1Tensor, q3Tensor } = tf.tidy(() => {
        const [sampleSize, seriesLength] = tensor.shape;
        const numericTensor = tf.keep(tensor).toFloat();

        const minTensor = tf.min(numericTensor, 0);
        const maxTensor = tf.max(numericTensor, 0);
        const meanTensor = tf.mean(numericTensor, 0);

        const transposedTensor = tf.transpose(numericTensor);

        const q1K = sampleSize - Math.floor(sampleSize * 0.25);
        const medianK = sampleSize - Math.floor(sampleSize * 0.5);
        const q3K = sampleSize - Math.floor(sampleSize * 0.75);

        const medianTensor = tf
            .topk(transposedTensor, medianK)
            .values.slice([0, medianK - 1], [seriesLength, 1])
            .squeeze([1]);

        const q1Tensor = tf
            .topk(tf.neg(transposedTensor), sampleSize - q1K)
            .values.slice([0, sampleSize - q1K - 1], [seriesLength, 1])
            .squeeze([1])
            .neg();

        const q3Tensor = tf
            .topk(transposedTensor, q3K)
            .values.slice([0, q3K - 1], [seriesLength, 1])
            .squeeze([1]);

        return { minTensor, maxTensor, medianTensor, meanTensor, q1Tensor, q3Tensor };
    });

    const minArray = (await minTensor.array()) as number[];
    const maxArray = (await maxTensor.array()) as number[];
    const medianArray = (await medianTensor.array()) as number[];
    const meanArray = (await meanTensor.array()) as number[];
    const q1Array = (await q1Tensor.array()) as number[];
    const q3Array = (await q3Tensor.array()) as number[];

    minTensor.dispose();
    maxTensor.dispose();
    medianTensor.dispose();
    q1Tensor.dispose();
    q3Tensor.dispose();

    const values: BoxPlotPoint[] = minArray.map(
        (v, i) =>
            ({
                min: v,
                max: maxArray[i],
                median: medianArray[i],
                mean: meanArray[i],
                q1: q1Array[i],
                q3: q3Array[i]
            }) as BoxPlotPoint
    );

    console.log(`calculated box plot data in ${+new Date() - started}ms`);

    return values;
};

export const getDeterministicSeriesPlotDataFromTensor = async (
    tensor: tf.Tensor
): Promise<DeterministicSeriesPlotData> => {
    const values = (await tensor.array()) as number[];
    return { values };
};
