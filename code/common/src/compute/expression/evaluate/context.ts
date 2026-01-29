import { TypedTensor } from "../../tensor";

export interface ExpressionTensorContext {
    mcRuns: number;
    tensorByVariable: { [variable: string]: TypedTensor };
}
