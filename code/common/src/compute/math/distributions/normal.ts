import gaussian from "gaussian";

export const getNormalDistributionSample = (
  lower: number,
  upper: number,
  size: number,
) => {
  const { mean, stddev } = getNormalDistributionParameter(lower, upper);
  const variance = stddev ** 2;
  const distribution = gaussian(mean, variance);
  return [...Array(size).keys()].map(() => distribution.ppf(Math.random()));
};

export const getNormalDistributionParameter = (
  lower: number,
  upper: number,
) => {
  const q95_Z = 1.6448536269514722;

  const mean = (lower + upper) / 2;
  const stddev = (upper - mean) / q95_Z;

  return {
    mean,
    stddev,
  };
};
