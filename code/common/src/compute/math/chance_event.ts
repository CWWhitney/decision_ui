import * as tf from "@tensorflow/tfjs";
import { valueVarier } from "./vv";
import { getTypedTensorFromConstant, TypedTensor } from "../tensor";
import { toProbabilistic, toSeries } from "./broadcast";

export const chanceEvent = ({
    mcRuns,
    chance,
    valueIf,
    valueIfNot,
    n,
    cvIf,
    cvIfNot,
    oneDraw
}: {
    mcRuns: number;
    chance: TypedTensor;
    valueIf?: TypedTensor;
    valueIfNot?: TypedTensor;
    n?: TypedTensor;
    cvIf?: TypedTensor;
    cvIfNot?: TypedTensor;
    oneDraw?: TypedTensor;
}) => {
    // default values
    chance = toProbabilistic(chance, mcRuns);

    let chanceT = chance.tensor;
    let valueIfT = valueIf ? valueIf.tensor : tf.scalar(1);
    let valueIfNotT = valueIfNot ? valueIfNot.tensor : tf.scalar(0);
    const nT = n ? n.tensor : tf.scalar(1);
    const oneDrawT = oneDraw ? oneDraw.tensor : tf.scalar(0);
    cvIf = cvIf ? cvIf : getTypedTensorFromConstant(tf.scalar(0));
    cvIfNot = cvIfNot ? cvIfNot : getTypedTensorFromConstant(tf.scalar(0));

    if (!tf.util.arraysEqual(valueIfT.shape, valueIfNotT.shape)) {
        throw new Error(
            `chanceEvent valueIf and valueIfNot have to have the same shape, but are ` +
                `${JSON.stringify(valueIfT.shape)} and ${JSON.stringify(valueIfNotT.shape)}`
        );
    }
    const nValue = nT.arraySync() as number;

    if (Math.ceil(nValue) != nValue) {
        throw new Error("chanceEvent parameter 'n' needs to be an integer");
    }
    if (nValue < 1) {
        throw new Error("chanceEvent parameter 'n' needs to be at least 1 or greater");
    }

    const oneDrawValue = (oneDrawT.arraySync() as number) > 0.5;

    valueIfT = nValue > 1 ? valueVarier({ mcRuns, varMean: valueIf, varCv: cvIf, n }).tensor : valueIfT;
    valueIfNotT = nValue > 1 ? valueVarier({ mcRuns, varMean: valueIfNot, varCv: cvIfNot, n }).tensor : valueIfNotT;
    chanceT = nValue > 1 ? toSeries(chance, nValue).tensor : chanceT;

    const onesShape = [mcRuns, ...Array(Math.max(0, valueIfT.shape.length - 1)).fill(1)];
    const outputShape = valueIfT.shape.length == 0 ? [mcRuns] : valueIfT.shape;

    const occurrence = oneDrawValue
        ? tf.randomUniform(onesShape).less(chanceT).cast("int32")
        : tf.randomUniform(outputShape).less(chanceT).cast("int32");

    return {
        tensor: tf.add(tf.mul(occurrence, valueIfT), tf.mul(tf.sub(1, occurrence), valueIfNotT)),
        isProbabilistic: true,
        isSeries: valueIf.isSeries || nValue > 1
    };
};
