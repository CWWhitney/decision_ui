export type ComputationResultValueType = "value";
export const COMPUTATION_RESULT_VALUE_TYPE = "value";

export type ComputationResultErrorType = "error";
export const COMPUTATION_RESULT_ERROR_TYPE = "error";

export type ComputationValueData = number | number[] | number[][];
export type ComputationValueShape = "constant" | number[];
export type ComputationValueType =
  | "deterministic"
  | "deterministic_int"
  | "probabilistic"
  | "probabilistic_int"
  | "series";

export interface ComputationValue {
  data: ComputationValueData;
  type: ComputationValueType;
  shape: ComputationValueShape;
}

export interface AbstractComputationResult<T> {
  type: T;
}

export interface ComputationValueResult
  extends AbstractComputationResult<ComputationResultValueType> {
  value: ComputationValue;
}

export interface ComputationErrorResult
  extends AbstractComputationResult<ComputationResultErrorType> {
  errors: string[];
}

export type ComputationResult =
  | null
  | ComputationValueResult
  | ComputationErrorResult;
