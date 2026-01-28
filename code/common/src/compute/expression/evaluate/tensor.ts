import { getBackend, ready as tensorflowReady, ENV as tensorflowENV, type Tensor } from "@tensorflow/tfjs";

import { DETERMINISTIC_TYPE, PROBABILISTIC_TYPE, SERIES_TYPE } from "../../value";
import { TensorDescriptor } from "../../tensor";

tensorflowReady().then(() => {
    const backend = getBackend();
    const float32support = tensorflowENV.getBool("WEBGL_RENDER_FLOAT32_CAPABLE");
    const float32enabled = tensorflowENV.getBool("WEBGL_RENDER_FLOAT32_ENABLED");
    console.log(`tensorflow is ready with backend '${backend}' (float32 = ${float32support && float32enabled})`);
});

export type ComputedTensor =
    | {
          type: "success";
          value: Tensor;
      }
    | {
          type: "error";
          message: string;
      };

export const tensorToDescriptor = (tensor: Tensor): TensorDescriptor => {
    const shape = tensor.shape;
    const dtype = `${tensor.dtype}`;

    switch (shape.length) {
        case 0:
            return {
                type: DETERMINISTIC_TYPE,
                shape: [],
                dtype
            };
        case 1:
            return {
                type: PROBABILISTIC_TYPE,
                shape: shape as [number],
                dtype
            };
        case 2: {
            return {
                type: SERIES_TYPE,
                shape: shape as [number, number],
                dtype
            };
        }
        default:
            throw new Error(`unsupported tensor shape: ${JSON.stringify(shape)}`);
    }
};
