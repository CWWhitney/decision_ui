import { Chart, type ChartDataset } from "chart.js";

import { CHART_COLORS, getDefaultHistogramLegend } from "./common";

const TEXT_COLOR = "rgba(50, 50, 50, 1.0)";
const GRID_COLOR = "rgba(155, 155, 155, 0.2)";

export const drawEvpiBoxChart = (
    chart: Chart<"bar"> | null,
    ctx: CanvasRenderingContext2D,
    data: { [estimate: string]: { [result: string]: number } },
    device_pixel_ratio: number = 1.0
): Chart<"bar"> => {
    if (chart) chart.destroy();

    const estimateVariables = Object.keys(data);
    const resultVariables = Object.keys(data[estimateVariables[0]!] ?? {});

    return new Chart<"bar">(ctx, {
        type: "bar",

        data: {
            labels: estimateVariables,
            datasets: resultVariables.map((r, idx) => {
                return {
                    label: r,
                    data: estimateVariables.map(e => data[e]![r]) as number[],
                    backgroundColor: CHART_COLORS[idx % CHART_COLORS.length]
                } as ChartDataset<"bar", any>;
            })
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            resizeDelay: 0,
            animation: false,
            indexAxis: "y",
            devicePixelRatio: device_pixel_ratio,
            scales: {
                x: {
                    type: "linear",
                    ticks: {
                        color: TEXT_COLOR
                    },
                    grid: {
                        color: GRID_COLOR
                    }
                },
                y: {
                    type: "category",
                    ticks: {
                        autoSkip: false,
                        color: TEXT_COLOR,
                        font: {
                            size: 14
                        }
                    },
                    grid: {
                        color: GRID_COLOR
                    }
                }
            },
            plugins: {
                legend: getDefaultHistogramLegend(TEXT_COLOR)
            }
        }
    });
};
