import * as tf from "@tensorflow/tfjs";
import { probabilisticTensorToProbabilisticSeries } from "./broadcast";

export const chanceEvent = ({
    mcRuns,
    seriesLength,
    chance,
    valueIf,
    valueIfNot,
    oneDraw
}: {
    mcRuns: number;
    seriesLength: number;
    chance: tf.Tensor;
    valueIf: tf.Tensor;
    valueIfNot: tf.Tensor;
    oneDraw: boolean;
}) => {
    const randomSample =
        oneDraw && seriesLength > 1
            ? probabilisticTensorToProbabilisticSeries(tf.randomUniform([mcRuns]), seriesLength)
            : tf.randomUniform(chance.shape);

    const occurrence = randomSample.less(chance).cast("int32");

    return tf.add(tf.mul(occurrence, valueIf), tf.mul(tf.sub(1, occurrence), valueIfNot));
};
