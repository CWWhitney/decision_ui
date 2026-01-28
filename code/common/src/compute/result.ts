export type ComputedResult<T> =
    | {
          type: "success";
          value: T;
      }
    | {
          type: "error";
          message: string;
      };
