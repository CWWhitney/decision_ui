import { moments, Tensor, tidy } from "@tensorflow/tfjs";

export interface SeriesPlotData {
    means: number[];
    stddevs: number[];
}

export const getSeriesPlotDataFromTensor = async (tensor: Tensor): Promise<SeriesPlotData> => {
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
