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
    PointElement
} from "chart.js";

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

Chart.register(BarController, ScatterController, LinearScale, BarElement, PointElement, Colors, Legend, CategoryScale);

export const getDefaultHistogramScales = (
    max_ticks: number,
    textColor: string,
    gridColor: string,
    beginAtZero: boolean
): DeepPartial<ScaleChartOptions<"bar" | "scatter">> => {
    return {
        scales: {
            x: {
                type: "linear",
                beginAtZero: false,
                bounds: "data",
                ticks: {
                    maxRotation: 90,
                    minRotation: 0,
                    autoSkip: false,
                    maxTicksLimit: max_ticks,
                    color: textColor,
                    callback: value => +(value as number).toFixed(5)
                },
                grid: {
                    color: gridColor,
                    offset: false
                }
            },
            y: {
                type: "linear",
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

export const getDefaultHistogramOptions = (): ChartOptions<"bar"> => {
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
                radius: 4
            }
        }
    };
};
