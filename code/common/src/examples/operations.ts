import { MODEL_FILE_VERSION, ModelFileState } from "../io";

/* eslint-disable max-len */

export const getOperationsExampleModelFile = (): ModelFileState => {
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
                        variable: "Cost",
                        distribution: "posnorm",
                        lower: 50,
                        upper: 200,
                        comment: "",
                        isModifiable: true,
                        lowerBounds: [25, 100],
                        upperBounds: [150, 250],
                        rangeStep: 5
                    },
                    visualization: {
                        title: "Cost",
                        position: {
                            x: 310,
                            y: 210
                        },
                        size: {
                            width: 200,
                            height: 50
                        },
                        style: {
                            type: "cost"
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
                        type: "estimate",
                        variable: "Benefit",
                        distribution: "posnorm",
                        lower: 100,
                        upper: 150,
                        comment: "",
                        isModifiable: true,
                        lowerBounds: [50, 150],
                        upperBounds: [100, 200],
                        rangeStep: 10
                    },
                    visualization: {
                        title: "Benefit",
                        position: {
                            x: 310,
                            y: 100
                        },
                        size: {
                            width: 200,
                            height: 50
                        },
                        style: {
                            type: "benefit"
                        },
                        autoConnect: true
                    }
                },
                {
                    id: "3",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: null,
                    function: {
                        type: "operation",
                        variable: "Operation",
                        expression: "Benefit - Cost"
                    },
                    visualization: {
                        title: "Operation",
                        position: {
                            x: 620,
                            y: 150
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
                    id: "4",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: null,
                    function: {
                        type: "result",
                        variable: "Profit",
                        expression: "Operation"
                    },
                    visualization: {
                        title: "Profit",
                        position: {
                            x: 880,
                            y: 150
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
            name: "Operations",
            description:
                "This example demostrates how two estimates for benefit and cost can be combined to calculate the total profit.",
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
