import { Chart, type ChartDataset } from "chart.js";

import { getDefaultHistogramOptions, getDefaultHistogramScales, getDefaultScatterOptions } from "./common";

const TEXT_COLOR = "rgba(0, 0, 0, 1)";
const GRID_COLOR = "rgba(255, 255, 255, 0.2)";
const BAR_COLOR = "rgb(63, 149, 203)";
const STDDEV_COLOR = "rgb(153, 189, 211)";
const POINT_COLOR = "rgb(63, 149, 203)";

export const drawNodeEditDialogHistogram = (
    chart: Chart<"bar"> | null,
    ctx: CanvasRenderingContext2D,
    bins: number[],
    values: number[],
    label: string
): Chart<"bar"> => {
    const max_ticks = 5;

    if (chart) chart.destroy();

    console.log(`bins are: ${bins}`);
    console.log(`values are: ${values}`);

    return new Chart<"bar">(ctx, {
        type: "bar",
        data: {
            labels: bins,
            datasets: [
                {
                    data: values,
                    categoryPercentage: 1.0,
                    barPercentage: 1.05,
                    backgroundColor: BAR_COLOR
                } as ChartDataset<"bar", any>
            ]
        },
        options: {
            ...getDefaultHistogramOptions(),
            ...getDefaultHistogramScales(label, "occurrences", max_ticks, TEXT_COLOR, GRID_COLOR, true),
            plugins: {
                legend: { display: false }
            }
        }
    });
};

export const drawNodeEditDialogSeriesPlot = (
    chart: Chart<"bar"> | null,
    ctx: CanvasRenderingContext2D,
    means: number[],
    stddevs: number[],
    label: string
): Chart<"bar" | "scatter"> => {
    const max_ticks = 7;

    if (chart) chart.destroy();

    const indexes = Array.from(Array(means.length).keys()).map(i => `${i + 1}`);

    return new Chart<"bar">(ctx, {
        type: "bar",
        data: {
            labels: indexes,
            datasets: [
                {
                    data: means.map((m, i) => [m - stddevs[i]!, m + stddevs[i]!] as [number, number]),
                    categoryPercentage: 1.0,
                    maxBarThickness: 3,
                    barPercentage: 1.0,
                    backgroundColor: STDDEV_COLOR,
                    order: 1
                },
                {
                    data: means,
                    type: "scatter",
                    order: 0,
                    backgroundColor: POINT_COLOR
                } as any
            ]
        },
        options: {
            ...getDefaultHistogramOptions(),
            ...(getDefaultScatterOptions() as any),
            ...getDefaultHistogramScales("time", label, max_ticks, TEXT_COLOR, GRID_COLOR, false),
            plugins: {
                legend: { display: false }
            }
        }
    });
};
