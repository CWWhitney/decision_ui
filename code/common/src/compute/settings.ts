import { Schema } from "jsonschema";

export interface ComputationSettings {
    mcRuns: number;
    histogramBins: number;
}

export const ComputationSettingsSchema: Schema = {
    type: "object",
    properties: {
        mcRuns: { type: "number" },
        histogramBins: { type: "number" }
    },
    required: ["mcRuns", "histogramBins"]
};
