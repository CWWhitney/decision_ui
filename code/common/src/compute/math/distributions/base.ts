export const DETERMINISTIC_DISTRIBUTION_TYPE = "const";
export const NORMAL_DISTRIBUTION_TYPE = "norm";
export const POSNORM_DISTRIBUTION_TYPE = "posnorm";
export const TNORM01_DISTRIBUTION_TYPE = "tnorm_0_1";

export type DeterministicDistributionType = "const";
export type NormalDistributionType = "norm";
export type PosnormDistributionType = "posnorm";
export type TNorm01DistributionType = "tnorm_0_1";

export type DistributionType =
    | DeterministicDistributionType
    | NormalDistributionType
    | PosnormDistributionType
    | TNorm01DistributionType;

export const DISTRIBUTION_TYPES: DistributionType[] = [
    DETERMINISTIC_DISTRIBUTION_TYPE,
    NORMAL_DISTRIBUTION_TYPE,
    POSNORM_DISTRIBUTION_TYPE,
    TNORM01_DISTRIBUTION_TYPE
];

export const DISTRIBUTION_LABELS: { [key in DistributionType]: string } = {
    [DETERMINISTIC_DISTRIBUTION_TYPE]: "Deterministic (const)",
    [NORMAL_DISTRIBUTION_TYPE]: "Normal Distribution (norm)",
    [POSNORM_DISTRIBUTION_TYPE]: "Positive Truncated Normal Distribution (posnorm)",
    [TNORM01_DISTRIBUTION_TYPE]: "0-1 Truncated Normal Distribution (tnorm_0_1)"
};
