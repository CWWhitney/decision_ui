import { TypedTensor } from "../../tensor";

export interface ExpressionTensorContext {
    mcRuns: number;
    index: {
        iteration: number;
        length: number;
    } | null;
    tensorByVariable: { [variable: string]: TypedTensor };
}
