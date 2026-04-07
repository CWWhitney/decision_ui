import { computed, type ComputedRef } from "vue";

export const COMPUTED_RESULT_SUCCESS_TYPE = "success";
export const COMPUTED_RESULT_ERROR_TYPE = "error";

export type ComputedResultSuccessType = "success";
export type ComputedResultErrorType = "error";

export type ComputedResult<T> =
    | {
          type: ComputedResultSuccessType;
          value: T;
      }
    | {
          type: ComputedResultErrorType;
          message: string;
      };

export const extractComputedResultOrThrow = <T>(result: ComputedResult<T>): T => {
    if (result.type == COMPUTED_RESULT_SUCCESS_TYPE) {
        return result.value;
    }
    throw new Error(result.message);
};

export const catchForComputedResult = <T>(generate: () => T, message?: string): ComputedResult<T> => {
    try {
        return {
            type: COMPUTED_RESULT_SUCCESS_TYPE,
            value: generate()
        };
    } catch (e) {
        return {
            type: COMPUTED_RESULT_ERROR_TYPE,
            message: message ? message : e instanceof Error ? `${e.message}` : `${e}`
        };
    }
};

/**
 * Creates a vue computed by wrapping its getter into a try/catch clause, saving the error message in an object
 * and re-throwing the exception when the value is accessed via the returned getter.
 *
 * @param get the getter function to produce a value (same as in the vue computed function)
 * @returns a getter function that returns the computed value or throws an error if an error
 *  was previously thrown in the computed getter
 */
export const makeSafeComputedGetter = <T>(get: (previous: T | undefined) => T) => {
    const c = computed<ComputedResult<T>>(previous =>
        catchForComputedResult(() =>
            get(previous && previous.type == COMPUTED_RESULT_SUCCESS_TYPE ? previous.value : undefined)
        )
    );
    return (): T => extractComputedResultOrThrow(c.value);
};

/**
 * Create a vue computed for each key provided. Also wraps the getter in a try/catch clause and re-throws the error
 * every time the value is accessed from the returned getter.
 *
 * @param get the getter function that produces a value for a key
 * @param getMessage a function providing error messages overwriting the actual thrown errors
 * @returns a getter function which returns the computed value for the provided key or throws an error if an error
 *  was previously thrown in the computed getter
 */
export const makeSafeComputedGetterByKey = <K, T>(
    get: (key: K, previous: T | undefined) => T,
    getMessage?: (key: K) => string
) => {
    const cache = new Map<K, ComputedRef<ComputedResult<T>>>();
    return (key: K): T => {
        if (!cache.has(key)) {
            cache.set(
                key,
                computed<ComputedResult<T>>(previous =>
                    catchForComputedResult(
                        () =>
                            get(
                                key,
                                previous && previous.type == COMPUTED_RESULT_SUCCESS_TYPE ? previous.value : undefined
                            ),
                        getMessage ? getMessage(key) : undefined
                    )
                )
            );
        }
        return extractComputedResultOrThrow(cache.get(key)!.value);
    };
};
