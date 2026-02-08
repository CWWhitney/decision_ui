import { Schema } from "jsonschema";

export interface ComputationFileState {
    mcRuns: number;
    histogramBins: number;
}

export const ComputationFileSchema: Schema = {
    type: "object",
    properties: {
        mcRuns: { type: "number" },
        histogramBins: { type: "number" }
    },
    required: ["mcRuns", "histogramBins"]
};
