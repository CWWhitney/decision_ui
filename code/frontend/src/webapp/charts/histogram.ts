import { Chart, type ChartDataset } from "chart.js";

import { getDefaultChartOptions, getDefaultChartScales } from "./common";
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
