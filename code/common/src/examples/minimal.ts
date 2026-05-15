import { MODEL_FILE_VERSION, ModelFileState } from "../io";

export const getMinimalExampleModelFile = (): ModelFileState => {
    return {
        _schema: {
            name: "de.uni-bonn.decision-model/file",
            version: MODEL_FILE_VERSION
        },
        graph: {
            nodes: [
                {
                    id: "1",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: null,
                    function: {
                        type: "estimate",
                        variable: "Estimate",
                        unit: "",
                        distribution: "norm",
                        lower: -1,
                        upper: 1,
                        comment: "",
                        isModifiable: true,
                        lowerBounds: [-2, 0],
                        upperBounds: [0, 2],
                        rangeStep: 0.1
                    },
                    visualization: {
                        title: "Estimate",
                        position: {
                            x: 420,
                            y: 320
                        },
                        size: {
                            width: 200,
                            height: 50
                        },
                        style: {
                            type: "generic"
                        },
                        autoConnect: true
                    }
                },
                {
                    id: "2",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: null,
                    function: {
                        type: "result",
                        variable: "Result",
                        unit: "",
                        expression: "Estimate"
                    },
                    visualization: {
                        title: "Result",
                        position: {
                            x: 830,
                            y: 320
                        },
                        size: {
                            width: 200,
                            height: 50
                        },
                        style: {
                            type: "result"
                        },
                        autoConnect: true
                    }
                }
            ],
            edges: []
        },
        metadata: {
            name: "Minimal",
            description: "A minimal model consisting only of one estimate and one result node.",
            creationDate: `${new Date().toUTCString()}`,
            lastModified: `${new Date().toUTCString()}`
        },
        computation: {
            frontend: {
                mcRuns: 10000,
                histogramBins: 40,
                gpuAcceleration: true
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
        },
        editor: {
            locked: false,
            snapToGrid: true,
            edgeStyle: "smooth-step",
            background: "dots",
            autoAddComputationEdges: true,
            autosave: true
        }
    };
};
