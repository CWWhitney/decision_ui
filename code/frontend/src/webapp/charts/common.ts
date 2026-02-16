import type { ChartOptions, LegendOptions, ScaleChartOptions } from "chart.js";
import {
    BarController,
    BarElement,
    Chart,
    LinearScale,
    Colors,
    Legend,
    CategoryScale,
    ScatterController,
    PointElement,
    Tooltip
} from "chart.js";

import { BoxPlotController, BoxAndWiskers } from "@sgratzl/chartjs-chart-boxplot";

/* eslint @typescript-eslint/no-unsafe-function-type: 0 */

// copied from internal chartjs typings
type _DeepPartialArray<T> = Array<DeepPartial<T>>;
type _DeepPartialObject<T> = { [P in keyof T]?: DeepPartial<T[P]> };

// copied from intenral chartjs typings
export type DeepPartial<T> = T extends Function
    ? T
    : T extends Array<infer U>
      ? _DeepPartialArray<U>
      : T extends object
        ? _DeepPartialObject<T>
        : T | undefined;

export const CHART_COLORS = [
    "rgba(206, 147, 216, 0.7)", // purple
    "rgba(77, 182, 172, 0.7)", // gree
    "rgba(54, 162, 235, 0.7)", // blue
    "rgba(255, 99, 132, 0.7)", // red
    "rgba(255, 159, 64, 0.7)", // orange
    "rgba(255, 205, 86, 0.7)", // yellow
    "rgba(201, 203, 207, 0.7)" // grey
];

Chart.register(
    BarController,
    ScatterController,
    BoxPlotController,
    BoxAndWiskers,
    LinearScale,
    BarElement,
    PointElement,
    Colors,
    Legend,
    CategoryScale,
    Tooltip
);

export const getDefaultChartScales = (
    xLabel: string,
    yLabel: string,
    maxValue: number,
    minValue: number,
    max_ticks: number,
    textColor: string,
    gridColor: string,
    beginAtZero: boolean
): DeepPartial<ScaleChartOptions<"bar" | "scatter" | "boxplot">> => {
    return {
        scales: {
            x: {
                type: "linear",
                beginAtZero: false,
                title: {
                    display: true,
                    text: xLabel,
                    font: {
                        size: 14
                    },
                    color: textColor
                },
                bounds: "ticks",
                max: maxValue,
                min: minValue,
                stacked: false,
                ticks: {
                    maxRotation: 90,
                    minRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: max_ticks,
                    color: textColor,
                    callback: value => `${Number(Number(value).toPrecision(3))}`
                },
                grid: {
                    color: gridColor,
                    offset: false
                }
            },
            y: {
                type: "linear",
                title: {
                    display: true,
                    text: yLabel,
                    font: {
                        size: 14
                    },
                    color: textColor
                },
                stacked: false,
                beginAtZero,
                ticks: {
                    color: textColor,
                    maxTicksLimit: 5
                },
                grid: {
                    color: gridColor
                }
            }
        }
    };
};

export const getDefaultHistogramLegend = (textColor: string): DeepPartial<LegendOptions<"bar">> => {
    return {
        position: "top",
        labels: {
            color: textColor,
            font: {
                size: 14
            }
        }
    };
};

export const getDefaultChartOptions = (): ChartOptions<any> => {
    return {
        responsive: true,
        resizeDelay: 0,
        animation: false,
        maintainAspectRatio: false,
        hover: { mode: "nearest" }
    };
};

export const getDefaultScatterOptions = (): ChartOptions<"scatter"> => {
    return {
        elements: {
            point: {
                radius: 5
            }
        }
    };
};
