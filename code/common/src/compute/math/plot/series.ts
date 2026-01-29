import { moments, Tensor, tidy } from "@tensorflow/tfjs";

export interface ProbabilisticSeriesPlotData {
    means: number[];
    stddevs: number[];
}

export interface DeterministicSeriesPlotData {
    values: number[];
}

export const getProbabilisticSeriesPlotDataFromTensor = async (
    tensor: Tensor
): Promise<ProbabilisticSeriesPlotData> => {
    const { meansTensor, stddevsTensor } = tidy(() => {
        const { mean: meansTensor, variance: varianceTensor } = moments(tensor, 0);
        const stddevsTensor = varianceTensor.sqrt();
        return { meansTensor, stddevsTensor };
    });

    const means = (await meansTensor.array()) as number[];
    const stddevs = (await stddevsTensor.array()) as number[];

    meansTensor.dispose();
    stddevsTensor.dispose();

    return { means, stddevs };
};

export const getDeterministicSeriesPlotDataFromTensor = async (
    tensor: Tensor
): Promise<DeterministicSeriesPlotData> => {
    const values = (await tensor.array()) as number[];
    return { values };
};
