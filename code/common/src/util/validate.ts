import { Schema, Validator } from "jsonschema";

export const validateJson = <T>(json: T, schema: Schema): string[] | null => {
    try {
        const validator = new Validator();
        const result = validator.validate(json, schema);

        if (result.valid) {
            return null;
        }

        return result.errors.map(e => `'${e.path}' ${e.message}`);
    } catch (e) {
        console.warn("error validating json", e);
        return [`error validating json: ${e.message}`];
    }
};
