import {
    assertTensorValue,
    assertTextValue,
    ExpressionValue,
    isNullValue,
    nullValue,
    textValue,
    TYPED_TENSOR_VALUE_TYPE,
    typedTensorValue,
    valueToProbabilistic
} from "./value";
import type { TypedTensorValue } from "./value";

import { deterministicValuerVarier, probabilisticValuerVarier } from "../../math/value_varier";

export const valueVarierExpression = ({
    mcRuns,
    varMean,
    varCv,
    n,
    distribution = null,
    absoluteTrend = null,
    relativeTrend = null,
    lowerLimit = null,
    upperLimit = null
}: {
    mcRuns: number;
    varMean: ExpressionValue;
    varCv: ExpressionValue;
    n: ExpressionValue;
    distribution?: ExpressionValue | null;
    absoluteTrend?: ExpressionValue | null;
    relativeTrend?: ExpressionValue | null;
    lowerLimit?: ExpressionValue | null;
    upperLimit?: ExpressionValue | null;
}): TypedTensorValue => {
    let varMeanTT = assertTensorValue(varMean, "vv parameter 'var_mean'");
    let varCvTT = assertTensorValue(varCv, "vv parameter 'var_cv'");
    const nTT = assertTensorValue(n, "vv parameter 'n'");
    const distributionTV =
        distribution && !isNullValue(distribution)
            ? assertTextValue(distribution, "vv parameter 'distribution'")
            : textValue("normal");
    let absoluteTrendTT =
        absoluteTrend && !isNullValue(absoluteTrend)
            ? assertTensorValue(absoluteTrend, "vv parameter 'absolute_trend'")
            : nullValue();
    let relativeTrendTT =
        relativeTrend && !isNullValue(relativeTrend)
            ? assertTensorValue(relativeTrend, "vv parameter 'relative_trend'")
            : nullValue();
    let lowerLimitTT =
        lowerLimit && !isNullValue(lowerLimit)
            ? assertTensorValue(lowerLimit, "vv parameter 'lower_limit'")
            : nullValue();
    let upperLimitTT =
        upperLimit && !isNullValue(upperLimit)
            ? assertTensorValue(upperLimit, "vv parameter 'upper_limit'")
            : nullValue();

    if (nTT.isProbabilistic || nTT.isSeries || nTT.tensor.shape.length != 0) {
        throw new Error("vv parameter 'n' needs to be a deterministic integer");
    }
    const nValue = nTT.tensor.arraySync() as number;

    if (Math.ceil(nValue) != nValue) {
        throw new Error("vv parameter 'n' needs to be an integer");
    }
    if (nValue <= 1) {
        throw new Error("vv parameter 'n' needs to be larger than 1");
    }
    if (distributionTV.text != "normal") {
        throw new Error(`vv only supports 'normal' distrubtion, got '${distributionTV.text}'`);
    }
    if (varMeanTT.isSeries) {
        throw new Error("vv var_mean cannot be a series");
    }
    if (varCvTT.isSeries) {
        throw new Error("vv var_cv cannot be a series");
    }
    if (absoluteTrendTT.type == TYPED_TENSOR_VALUE_TYPE && absoluteTrendTT.isSeries) {
        throw new Error("vv absolute_trend cannot be a series");
    }
    if (relativeTrendTT.type == TYPED_TENSOR_VALUE_TYPE && relativeTrendTT.isSeries) {
        throw new Error("vv relative_trend cannot be a series");
    }
    if (lowerLimitTT.type == TYPED_TENSOR_VALUE_TYPE && lowerLimitTT.isSeries) {
        throw new Error("vv lower_limit cannot be a series");
    }
    if (upperLimitTT.type == TYPED_TENSOR_VALUE_TYPE && upperLimitTT.isSeries) {
        throw new Error("vv upper_limit cannot be a series");
    }

    const probabilistic =
        varMeanTT.isProbabilistic ||
        varCvTT.isProbabilistic ||
        (absoluteTrendTT.type == TYPED_TENSOR_VALUE_TYPE && absoluteTrendTT.isProbabilistic) ||
        (relativeTrendTT.type == TYPED_TENSOR_VALUE_TYPE && relativeTrendTT.isProbabilistic) ||
        (lowerLimitTT.type == TYPED_TENSOR_VALUE_TYPE && lowerLimitTT.isProbabilistic) ||
        (upperLimitTT.type == TYPED_TENSOR_VALUE_TYPE && upperLimitTT.isProbabilistic);

    if (probabilistic) {
        varMeanTT = valueToProbabilistic(varMeanTT, mcRuns);
        varCvTT = valueToProbabilistic(varCvTT, mcRuns);
        absoluteTrendTT = valueToProbabilistic(absoluteTrendTT, mcRuns);
        relativeTrendTT = valueToProbabilistic(relativeTrendTT, mcRuns);
        lowerLimitTT = valueToProbabilistic(lowerLimitTT, mcRuns);
        upperLimitTT = valueToProbabilistic(upperLimitTT, mcRuns);

        return typedTensorValue({
            tensor: probabilisticValuerVarier({
                mcRuns,
                n: nValue,
                varMean: varMeanTT.tensor,
                varCv: varCvTT.tensor,
                absoluteTrend: absoluteTrendTT.type == TYPED_TENSOR_VALUE_TYPE ? absoluteTrendTT.tensor : null,
                relativeTrend: relativeTrendTT.type == TYPED_TENSOR_VALUE_TYPE ? relativeTrendTT.tensor : null,
                lowerLimit: lowerLimitTT.type == TYPED_TENSOR_VALUE_TYPE ? lowerLimitTT.tensor : null,
                upperLimit: upperLimitTT.type == TYPED_TENSOR_VALUE_TYPE ? upperLimitTT.tensor : null
            }),
            isProbabilistic: true,
            isSeries: true
        });
    }

    return typedTensorValue({
        tensor: deterministicValuerVarier({
            n: nValue,
            varMean: varMeanTT.tensor,
            varCv: varCvTT.tensor,
            absoluteTrend: absoluteTrendTT.type == TYPED_TENSOR_VALUE_TYPE ? absoluteTrendTT.tensor : null,
            relativeTrend: relativeTrendTT.type == TYPED_TENSOR_VALUE_TYPE ? relativeTrendTT.tensor : null,
            lowerLimit: lowerLimitTT.type == TYPED_TENSOR_VALUE_TYPE ? lowerLimitTT.tensor : null,
            upperLimit: upperLimitTT.type == TYPED_TENSOR_VALUE_TYPE ? upperLimitTT.tensor : null
        }),
        isProbabilistic: false,
        isSeries: true
    });
};
