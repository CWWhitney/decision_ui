import * as tf from "@tensorflow/tfjs";
import { getSeriesLengthFromTypedTensor, getTypedTensorFromConstant } from "../../tensor";
import { ttToProbabilistic } from "../../math/broadcast";
import { assertTensorValue, ExpressionValue, isNullValue, typedTensorValue, TypedTensorValue } from "./value";
import { netPresentValue } from "../../math/npv";

export const netPresentValueExpression = ({
    mcRuns,
    x,
    discountRate,
    calculateNpv
}: {
    mcRuns: number;
    x: ExpressionValue;
    discountRate: ExpressionValue;
    calculateNpv?: ExpressionValue;
}): TypedTensorValue => {
    let xTT = assertTensorValue(x, "discount parameter 'x'");
    let discountRateTT = assertTensorValue(discountRate, "discount parameter 'discount_rate'");
    const calculateNpvTT =
        calculateNpv && !isNullValue(calculateNpv)
            ? assertTensorValue(calculateNpv, "discount parameter 'calculate_NPV'")
            : getTypedTensorFromConstant(tf.scalar(0));

    if (!xTT.isSeries) {
        throw new Error(`function 'discount' expects a time series as first parameter`);
    }
    if (discountRateTT.isSeries) {
        throw new Error(`discount rate may not be a series value`);
    }
    if (calculateNpvTT.isProbabilistic || calculateNpvTT.isSeries) {
        throw new Error(`calculate_NPV must be either true or false and cannot be probabilistic or a series`);
    }

    const calculateNpvBoolean = (calculateNpvTT.tensor.arraySync() as number) > 0.5;
    const seriesLength = getSeriesLengthFromTypedTensor(xTT);

    const isAnyProbablistic = xTT.isProbabilistic || discountRateTT.isProbabilistic;

    if (isAnyProbablistic) {
        xTT = ttToProbabilistic(xTT, mcRuns);
        discountRateTT = ttToProbabilistic(discountRateTT, mcRuns);
    }

    return typedTensorValue({
        tensor: netPresentValue({
            mcRuns: isAnyProbablistic ? mcRuns : 0,
            seriesLength,
            x: xTT.tensor,
            discountRate: discountRateTT.tensor,
            calculateNpv: calculateNpvBoolean
        }),
        isSeries: !calculateNpvBoolean,
        isProbabilistic: isAnyProbablistic
    });
};
