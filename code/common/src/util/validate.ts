import Ajv, { Schema } from "ajv";
import { prettify } from "awesome-ajv-errors";

export const validateSchema = <T>(schema: Schema): ((json: T) => string | false) => {
    const ajv = new Ajv({
        allErrors: true,
        strict: false
    });
    const validate = ajv.compile(schema);
    return (json: T) => {
        try {
            const valid = validate(json);
            if (!valid) {
                if (validate.errors) {
                    // return validate.errors?.map(e => `${e.instancePath}: ${e.message}`);
                    return prettify(validate, { data: json, colors: false, location: true });
                } else {
                    return `unknown validation error`;
                }
            }
            return false;
        } catch (e) {
            console.warn("unexpected error validating json", e);
            return `unexpected validation error: ${e.message}`;
        }
    };
};
