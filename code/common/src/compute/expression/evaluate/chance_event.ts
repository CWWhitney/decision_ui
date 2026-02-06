import * as tf from "@tensorflow/tfjs";
import { valueVarierExpression } from "./value_varier";
import { getSeriesLengthFromTypedTensor } from "../../tensor";
import { ttToProbabilistic, ttToSeries } from "../../math/broadcast";
import {
    assertTensorValue,
    constantTypedTensorValue,
    ExpressionValue,
    isNullValue,
    typedTensorValue,
    TypedTensorValue
} from "./value";
import { chanceEvent } from "../../math/chance_event";

export const chanceEventExpression = ({
    mcRuns,
    chance,
    valueIf = null,
    valueIfNot = null,
    n = null,
    cvIf = null,
    cvIfNot = null,
    oneDraw = null
}: {
    mcRuns: number;
    chance: ExpressionValue;
    valueIf?: ExpressionValue;
    valueIfNot?: ExpressionValue;
    n?: ExpressionValue;
    cvIf?: ExpressionValue;
    cvIfNot?: ExpressionValue;
    oneDraw?: ExpressionValue;
}): TypedTensorValue => {
    // default values
    let chanceTT = assertTensorValue(chance, "chanve_event 'chance'");
    let valueIfTT =
        valueIf && !isNullValue(valueIf)
            ? assertTensorValue(valueIf, "chance_event 'value_if'")
            : constantTypedTensorValue(tf.scalar(1));
    let valueIfNotTT =
        valueIfNot && !isNullValue(valueIfNot)
            ? assertTensorValue(valueIfNot, "chance_event 'value_if_not'")
            : constantTypedTensorValue(tf.scalar(0));
    const nTT =
        n && !isNullValue(n) ? assertTensorValue(n, "chance_event 'n'") : constantTypedTensorValue(tf.scalar(1));
    let cvIfTT =
        cvIf && !isNullValue(cvIf)
            ? assertTensorValue(cvIf, "chance_event 'cv_if'")
            : constantTypedTensorValue(tf.scalar(0));
    let cvIfNotTT = cvIfNot && !isNullValue(cvIfNot) ? assertTensorValue(cvIfNot, "chance_event 'cv_if_not'") : cvIfTT;
    const oneDrawTT =
        oneDraw && isNullValue(oneDraw)
            ? assertTensorValue(oneDraw, "chance_event 'one_draw'")
            : constantTypedTensorValue(tf.scalar(0));

    if (nTT.isSeries) {
        throw new Error("chance_event parameter 'n' cannot be a series");
    }
    if (nTT.isProbabilistic) {
        throw new Error("chance_event parameter 'n' cannot be probabilistic");
    }
    const nNumber = nTT.tensor.arraySync() as number;
    if (Math.ceil(nNumber) != nNumber || nNumber < 1) {
        throw new Error("chance_event parameter 'n' needs to be an integer of at least 1");
    }

    if (oneDrawTT.isSeries) {
        throw new Error("chance_event parameter 'oneDraw' cannot be a series");
    }
    if (oneDrawTT.isProbabilistic) {
        throw new Error("chance_event parameter 'oneDraw' cannot be probabilistic");
    }
    const oneDrawBoolean = (oneDrawTT.tensor.arraySync() as number) > 0.5;

    // is series
    const isAnySeries = nNumber > 1 || valueIfTT.isSeries || valueIfNotTT.isSeries;
    const seriesLength = valueIfTT.isSeries ? getSeriesLengthFromTypedTensor(valueIfTT) : nNumber;

    const valueIfSeriesLength = valueIfTT.isSeries ? getSeriesLengthFromTypedTensor(valueIfTT) : 1;
    const valueIfNotSeriesLength = valueIfNotTT.isSeries ? getSeriesLengthFromTypedTensor(valueIfNotTT) : 1;

    if (
        (valueIfTT.isSeries && seriesLength != valueIfSeriesLength) ||
        (valueIfNotTT.isSeries && seriesLength != valueIfNotSeriesLength)
    ) {
        throw new Error(
            `chanceEvent parameters 'n', 'value_if' and 'value_if_not' do not have the same series length, but are ` +
                `${nNumber}, ${valueIfSeriesLength} and ${valueIfNotSeriesLength}`
        );
    }

    // ensure everything is probabilistic
    chanceTT = ttToProbabilistic(chanceTT, mcRuns);
    valueIfTT = ttToProbabilistic(valueIfTT, mcRuns);
    valueIfNotTT = ttToProbabilistic(valueIfNotTT, mcRuns);
    cvIfTT = ttToProbabilistic(cvIfTT, mcRuns);
    cvIfNotTT = ttToProbabilistic(cvIfNotTT, mcRuns);

    valueIfTT =
        isAnySeries && !valueIfTT.isSeries
            ? valueVarierExpression({ mcRuns, varMean: valueIfTT, varCv: cvIfTT, n: nTT })
            : valueIfTT;

    valueIfNotTT =
        isAnySeries && !valueIfNotTT.isSeries
            ? valueVarierExpression({ mcRuns, varMean: valueIfNotTT, varCv: cvIfNotTT, n: nTT })
            : valueIfNotTT;

    chanceTT = isAnySeries && !chanceTT.isSeries ? ttToSeries(chanceTT, nNumber) : chanceTT;

    return typedTensorValue({
        tensor: chanceEvent({
            mcRuns,
            seriesLength,
            chance: chanceTT.tensor,
            valueIf: valueIfTT.tensor,
            valueIfNot: valueIfNotTT.tensor,
            oneDraw: oneDrawBoolean
        }),
        isProbabilistic: true,
        isSeries: isAnySeries
    });
};
