import { Chart } from "chart.js";

import { type BoxPlotPoint } from "@decision-support-ui/common";
import { getDefaultChartOptions, getDefaultChartScales } from "./common";
import type { BoxPlotDataPoint } from "@sgratzl/chartjs-chart-boxplot";

const TEXT_COLOR = "rgba(0, 0, 0, 1)";
const GRID_COLOR = "rgba(200, 200, 200, 0.5)";
const BAR_COLOR = "rgb(71, 158, 212)";
const BORDER_COLOR = "rgb(29, 81, 113)";
const MEAN_COLOR = "rgb(29, 81, 113)";

export const drawProbabilisticSeriesBoxPlotChart = (
    chart: Chart<"boxplot"> | null,
    ctx: CanvasRenderingContext2D,
    values: BoxPlotPoint[],
    label: string,
    devicePixelRatio: number = 1.0
): Chart<"boxplot"> => {
    const max_ticks = 7;

    if (chart) chart.destroy();

    const indexes = Array.from(Array(values.length).keys()).map(i => `${i + 1}`);

    return new Chart<"boxplot">(ctx, {
        type: "boxplot",
        data: {
            labels: indexes,
            datasets: [
                {
                    data: values as BoxPlotDataPoint[],
                    categoryPercentage: 1.0,
                    barPercentage: 0.5,
                    backgroundColor: BAR_COLOR,
                    borderColor: BORDER_COLOR,
                    medianColor: BORDER_COLOR,
                    meanBackgroundColor: MEAN_COLOR
                }
            ]
        },
        options: {
            devicePixelRatio,
            minStats: "whiskerMin",
            maxStats: "whiskerMax",
            ...getDefaultChartOptions(),
            ...getDefaultChartScales("time", label, values.length, 1, max_ticks, TEXT_COLOR, GRID_COLOR, false),
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    mode: "nearest",
                    callbacks: {
                        title: function (i) {
                            return `time = ${i[0]!.dataIndex + 1}`;
                        }
                    }
                }
            }
        }
    });
};
