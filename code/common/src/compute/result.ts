export type ComputationResultValueType = "value";
export const COMPUTATION_RESULT_VALUE_TYPE = "value";

export type ComputationResultErrorType = "error";
export const COMPUTATION_RESULT_ERROR_TYPE = "error";

export type ComputationValueData = number | number[] | number[][];
export type ComputationValueShape = number[];

export type DeterministicComputationValueType = "deterministic";
export type ProbabilisticComputationValueType = "probabilistic";
export type SeriesComputationValueType = "series";

export const DETERMINISTIC_COMPUTATION_VALUE_TYPE = "deterministic";
export const PROBABILISTIC_COMPUTATION_VALUE_TYPE = "probabilistic";
export const SERIES_COMPUTATION_VALUE_TYPE = "series";

export type ComputationValueType =
  | DeterministicComputationValueType
  | ProbabilisticComputationValueType
  | SeriesComputationValueType;

export interface AbstractComputationValue<T> {
  type: T;
}

export interface DeterministicComputationValue extends AbstractComputationValue<DeterministicComputationValueType> {
  data: number;
  shape: [];
}

export interface ProbabilisticComputationValue extends AbstractComputationValue<ProbabilisticComputationValueType> {
  data: number[];
  shape: [number];
}

export interface SeriesComputationValue extends AbstractComputationValue<SeriesComputationValueType> {
  data: number[][];
  shape: [number, number];
}
export type ComputationValue =
  | DeterministicComputationValue
  | ProbabilisticComputationValue
  | SeriesComputationValue;

export interface AbstractComputationResult<T> {
  type: T;
}

export interface ComputationValueResult extends AbstractComputationResult<ComputationResultValueType> {
  value: ComputationValue;
}

export interface ComputationErrorResult extends AbstractComputationResult<ComputationResultErrorType> {
  message: string;
}

export type ComputationResult = ComputationValueResult | ComputationErrorResult;
