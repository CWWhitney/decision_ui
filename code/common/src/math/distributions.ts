import gaussian from "gaussian";

export type DistributionFunctionType =
  | "deterministic"
  | "norm"
  | "posnorm"
  | "tnorm_0_1";

export const getNormalDistributionSample = (
  lower: number,
  upper: number,
  size: number
) => {
  const q95_Z = 1.6448536269514722;

  const mean = (lower + upper) / 2;
  const std = (upper - mean) / q95_Z;
  const variance = std ** 2;
  const distribution = gaussian(mean, variance);
  return [...Array(size).keys()].map(() => distribution.ppf(Math.random()));
};
