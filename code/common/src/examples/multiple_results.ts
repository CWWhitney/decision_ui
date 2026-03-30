import { ModelFileState } from "../io";

export const getMultipleResultsExampleModelFile = (): ModelFileState => {
    return {
        _schema: {
            name: "de.uni-bonn.decision-model/file",
            version: 2
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
                        variable: "Estimate_1",
                        distribution: "posnorm",
                        lower: 10,
                        upper: 100,
                        comment: "",
                        isModifiable: true,
                        lowerBounds: [-2, 10],
                        upperBounds: [0, 100],
                        rangeStep: 0.1
                    },
                    visualization: {
                        title: "Estimate 1",
                        position: {
                            x: 280,
                            y: 110
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
                        type: "estimate",
                        variable: "Estimate_2",
                        distribution: "posnorm",
                        lower: 400,
                        upper: 600,
                        comment: "",
                        isModifiable: true,
                        lowerBounds: [-2, 400],
                        upperBounds: [0, 600],
                        rangeStep: 0.1
                    },
                    visualization: {
                        title: "Estimate 2",
                        position: {
                            x: 280,
                            y: 230
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
                    id: "3",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: null,
                    function: {
                        type: "estimate",
                        variable: "Estimate_3",
                        distribution: "posnorm",
                        lower: 100,
                        upper: 500,
                        comment: "",
                        isModifiable: true,
                        lowerBounds: [-2, 100],
                        upperBounds: [0, 500],
                        rangeStep: 0.1
                    },
                    visualization: {
                        title: "Estimate 3",
                        position: {
                            x: 280,
                            y: 350
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
                        variable: "Result_1",
                        expression: "Estimate_1"
                    },
                    visualization: {
                        title: "Result 1",
                        position: {
                            x: 570,
                            y: 110
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
                },
                {
                    id: "5",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: null,
                    function: {
                        type: "result",
                        variable: "Result_2",
                        expression: "Estimate_2"
                    },
                    visualization: {
                        title: "Result 2",
                        position: {
                            x: 570,
                            y: 230
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
                },
                {
                    id: "6",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: null,
                    function: {
                        type: "result",
                        variable: "Result_3",
                        expression: "Estimate_3"
                    },
                    visualization: {
                        title: "Result 3",
                        position: {
                            x: 570,
                            y: 350
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
            name: "Multiple Results",
            description: "A model comparing scenarios by defining multiple result nodes.",
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
            autoAddComputationEdges: true
        }
    };
};
