import { ModelFileState } from "./base";

export const migrateModelFile = (file: any): ModelFileState => {
    if (!file._schema || file._schema.name != "de.uni-bonn.decision-model/file") {
        // object is not a model file and will return validation errors
        return file;
    }

    if (file._schema.version == 1) {
        // migrate from v1 to v2
        file.computation = {
            frontend: {
                ...file.computation
            },
            backend: {
                resultHistogram: {
                    mcRuns: 10000,
                    histogramBins: 40,
                    maxRuntime: 10
                },
                evpi: {
                    mcRuns: 2000,
                    maxRuntime: 20
                }
            }
        };

        file._schema = {
            ...file._schema,
            version: 2
        };
    }

    if (file._schema.version == 2) {
        // migrate from v2 to v3
        file.editor = {
            ...file.editor,
            autosave: false
        };

        file._schema = {
            ...file._schema,
            version: 3
        };
    }

    return file;
};
