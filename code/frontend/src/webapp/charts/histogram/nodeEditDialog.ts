import { Chart, type ChartDataset } from "chart.js";

import { getDefaultHistogramOptions, getDefaultHistogramScales, getDefaultScatterOptions } from "./common";
import { numberToPrettyString } from "@decision-support-ui/common";

const TEXT_COLOR = "rgba(0, 0, 0, 1)";
const GRID_COLOR = "rgba(255, 255, 255, 0.2)";
const BAR_COLOR = "rgb(63, 149, 203)";
const STDDEV_COLOR = "rgb(153, 189, 211)";
const POINT_COLOR = "rgb(63, 149, 203)";

export const drawHistogramChart = (
    chart: Chart<"bar"> | null,
    ctx: CanvasRenderingContext2D,
    bins: number[],
    values: number[],
    label: string,
    devicePixelRatio: number = 1.0
): Chart<"bar"> => {
    const max_ticks = 7;

    if (chart) chart.destroy();

    console.log(`draw histogram with bins=${JSON.stringify(bins)} and counts=${JSON.stringify(values)}`);

    return new Chart<"bar">(ctx, {
        type: "bar",
        data: {
            labels: bins,
            datasets: [
                {
                    data: values,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0,
                    backgroundColor: BAR_COLOR
                } as ChartDataset<"bar", any>
            ]
        },
        options: {
            devicePixelRatio,
            ...getDefaultHistogramOptions(),
            ...getDefaultHistogramScales(
                label,
                "occurrences",
                Math.max(...bins),
                Math.min(...bins),
                max_ticks,
                TEXT_COLOR,
                GRID_COLOR,
                true
            ),
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    mode: "nearest",
                    callbacks: {
                        title: function (i) {
                            return `bin = [${numberToPrettyString(bins[i[0]!.dataIndex])}, ${numberToPrettyString(bins[i[0]!.dataIndex + 1])}]`;
                        },
                        label: i => `occurrences = ${numberToPrettyString(values[i.dataIndex])}`
                    }
                }
            }
        }
    });
};

export const drawProbabilisticSeriesChart = (
    chart: Chart<"bar"> | null,
    ctx: CanvasRenderingContext2D,
    means: number[],
    stddevs: number[],
    label: string,
    devicePixelRatio: number = 1.0
): Chart<"bar" | "scatter"> => {
    const max_ticks = 7;

    if (chart) chart.destroy();

    const indexes = Array.from(Array(means.length).keys()).map(i => `${i + 1}`);

    return new Chart<"bar" | "scatter">(ctx, {
        type: "bar",
        data: {
            labels: indexes,
            datasets: [
                {
                    data: means.map((m, i) => [m - stddevs[i]!, m + stddevs[i]!] as [number, number]),
                    maxBarThickness: 4,
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
            devicePixelRatio,
            ...getDefaultHistogramOptions(),
            ...(getDefaultScatterOptions() as any),
            ...getDefaultHistogramScales("time", label, means.length, 1, max_ticks, TEXT_COLOR, GRID_COLOR, false),
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    mode: "nearest",
                    callbacks: {
                        title: function (i) {
                            return `time = ${i[0]!.dataIndex + 1}`;
                        },
                        label: i =>
                            `mean = ${numberToPrettyString(means[i.dataIndex])}, ` +
                            `stddev = ${numberToPrettyString(stddevs[i.dataIndex])}`
                    }
                }
            }
        }
    });
};
