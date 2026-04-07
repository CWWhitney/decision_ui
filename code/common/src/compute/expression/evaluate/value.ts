import * as tf from "@tensorflow/tfjs";

import { getTypedTensorFromConstant, TypedTensor } from "../../tensor";
import { ttToProbabilistic, ttToSeries } from "../../math/broadcast";

export type NullResultType = "null";
export type TextResultType = "text";
export type TensorResultType = "tensor";

export const NULL_VALUE_TYPE = "null";
export const TEXT_VALUE_TYPE = "text";
export const TYPED_TENSOR_VALUE_TYPE = "tensor";

export interface NullValue {
    type: NullResultType;
}

export interface TextValue {
    type: TextResultType;
    text: string;
}

export interface TypedTensorValue extends TypedTensor {
    type: TensorResultType;
}

export type ExpressionValue = NullValue | TextValue | TypedTensorValue;

export const assertTensorValue = (er: ExpressionValue, context: string = "value"): TypedTensorValue => {
    if (er.type != TYPED_TENSOR_VALUE_TYPE) {
        throw new Error(`${context} is not a tensor`);
    }
    return er as TypedTensorValue;
};

export const assertTextValue = (er: ExpressionValue, context: string = "value"): TextValue => {
    if (er.type != TEXT_VALUE_TYPE) {
        throw new Error(`${context} is not text`);
    }
    return er as TextValue;
};

export const isNullValue = (er: ExpressionValue): boolean => {
    return er.type == NULL_VALUE_TYPE;
};

export const isTensorValue = (er: ExpressionValue): boolean => {
    return er.type == TYPED_TENSOR_VALUE_TYPE;
};

export const textValue = (text: string): TextValue => {
    return {
        type: TEXT_VALUE_TYPE,
        text
    };
};

export const nullValue = (): NullValue => {
    return { type: NULL_VALUE_TYPE };
};

export const typedTensorValue = (tt: TypedTensor): TypedTensorValue => {
    return {
        ...tt,
        type: TYPED_TENSOR_VALUE_TYPE
    };
};

export const constantTypedTensorValue = (t: tf.Tensor) => typedTensorValue(getTypedTensorFromConstant(t));

export const valueToProbabilistic = <T extends ExpressionValue>(ev: T, mcRuns: number): T => {
    if (ev.type == TYPED_TENSOR_VALUE_TYPE) {
        return ttToProbabilistic(ev, mcRuns) as T;
    }
    return ev;
};

export const valueToSeries = <T extends ExpressionValue>(ev: T, n: number): ExpressionValue => {
    if (ev.type == TYPED_TENSOR_VALUE_TYPE) {
        return ttToSeries(ev, n) as T;
    }
    return ev;
};
