import { Chart, type ChartDataset } from "chart.js";

import { CHART_COLORS, getDefaultChartOptions, getDefaultChartScales, getDefaultHistogramLegend } from "./common";
import { numberToPrettyString } from "@decision-support-ui/common";

const TEXT_COLOR = "rgba(0, 0, 0, 1)";
const GRID_COLOR = "rgba(200, 200, 200, 0.5)";
const BAR_COLOR = "rgb(63, 149, 203)";

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
            ...getDefaultChartOptions(),
            ...getDefaultChartScales(
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

export const drawMultiHistogramChart = (
    chart: Chart<"bar"> | null,
    ctx: CanvasRenderingContext2D,
    bins: number[],
    counts: number[][],
    labels: string[],
    device_pixel_ratio: number = 1.0
): Chart<"bar"> => {
    const max_ticks = 10;
    const n_variables = Object.keys(labels).length;

    if (chart) chart.destroy();

    return new Chart<"bar">(ctx, {
        type: "bar",
        data: {
            labels: bins,
            datasets: labels.map((label, idx) => {
                return {
                    label,
                    data: counts[idx],
                    categoryPercentage: 1.0,
                    barPercentage: n_variables,
                    inflateAmount: 0,
                    stack: "overlay",
                    backgroundColor: CHART_COLORS[idx % CHART_COLORS.length]
                } as ChartDataset<"bar", any>;
            })
        },
        options: {
            ...getDefaultChartOptions(),
            ...getDefaultChartScales(
                "",
                "occurrences",
                Math.max(...bins),
                Math.min(...bins),
                max_ticks,
                TEXT_COLOR,
                GRID_COLOR,
                true
            ),
            devicePixelRatio: device_pixel_ratio,
            plugins: {
                legend: getDefaultHistogramLegend(TEXT_COLOR)
            }
        }
    });
};
