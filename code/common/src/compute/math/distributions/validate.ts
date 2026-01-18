export interface DistributionValidationError {
  type: "error";
  message: string;
}

export interface DistributionValidationWarning {
  type: "warning";
}

export interface DistributionValidationSuccess {
  type: "success";
}

export type DistributionValidationResult =
  | DistributionValidationSuccess
  | DistributionValidationWarning
  | DistributionValidationError;

export const validateLowerUpperBounds = (
  lower: number,
  upper: number,
  numeric_tolerance = 1e-5
) => {
  if (!(lower + numeric_tolerance < upper)) {
    return {
      type: "error",
      message: `Lower bound '${lower}' can not be larger than upper bound '${upper}'.`,
    };
  }
  return {
    type: "success",
  };
};
