import { DeterministcType, ProbabilisticType, SeriesType } from "./value";

export { type Tensor } from "@tensorflow/tfjs";

export interface TensorDescriptor {
    type: DeterministcType | ProbabilisticType | SeriesType;
    shape: [] | [number] | [number, number];
    dtype: string;
}
