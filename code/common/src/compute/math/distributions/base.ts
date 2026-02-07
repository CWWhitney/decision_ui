export const DETERMINISTIC_DISTRIBUTION_TYPE = "deterministic";
export const NORMAL_DISTRIBUTION_TYPE = "norm";
export const POSNORM_DISTRIBUTION_TYPE = "posnorm";
export const TNORM01_DISTRIBUTION_TYPE = "tnorm_0_1";

export type DeterministicDistributionType = "deterministic";
export type NormalDistributionType = "norm";
export type PosnormDistributionType = "posnorm";
export type TNorm01DistributionType = "tnorm_0_1";

export type DistributionType =
    | DeterministicDistributionType
    | NormalDistributionType
    | PosnormDistributionType
    | TNorm01DistributionType;

export const DISTRIBUTION_TYPES = [
    DETERMINISTIC_DISTRIBUTION_TYPE,
    NORMAL_DISTRIBUTION_TYPE,
    POSNORM_DISTRIBUTION_TYPE,
    TNORM01_DISTRIBUTION_TYPE
];
