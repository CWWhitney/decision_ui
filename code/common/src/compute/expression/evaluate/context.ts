import { Tensor } from "@tensorflow/tfjs";

export interface ExpressionTensorContext {
    mcRuns: number;
    tensorByVariable: { [variable: string]: Tensor };
}
