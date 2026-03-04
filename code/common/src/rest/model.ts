import { ModelFileState } from "../io";
import { ErrorResponseBody } from "./base";

export type ListModelsResponseBody =
    | {
          id: number;
          name: string;
          description: string;
          createdAt: string;
          updatedAt: string;
      }[]
    | ErrorResponseBody;

export type GetModelResponseBody = {
    id: number;
    modelfile: ModelFileState;
};
