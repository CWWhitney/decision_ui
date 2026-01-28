import { Tensor } from "@tensorflow/tfjs";

export interface ExpressionTensorContext {
    tensorByVariable: { [variable: string]: Tensor };
}
