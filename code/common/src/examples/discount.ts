import { MODEL_FILE_VERSION, ModelFileState } from "../io";

export const getDiscountExampleModelFile = (): ModelFileState => {
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
                        unit: "",
                        distribution: "posnorm",
                        lower: 50,
                        upper: 150,
                        comment: "",
                        isModifiable: true,
                        lowerBounds: [50, 150],
                        upperBounds: [150, 250],
                        rangeStep: 1
                    },
                    visualization: {
                        title: "Cost",
                        position: {
                            x: 800,
                            y: 330
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
                        type: "loop",
                        variable: "Cost_over_10_Years",
                        unit: "",
                        iterationsExpression: "10",
                        initExpression: "Cost",
                        loopExpression: "Cost"
                    },
                    visualization: {
                        title: "Cost over 10 Years",
                        position: {
                            x: 1100,
                            y: 330
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
                        type: "result",
                        variable: "Discounted_Cost",
                        unit: "",
                        expression: "discount(Cost_over_10_Years, 5, TRUE)"
                    },
                    visualization: {
                        title: "Discounted Cost",
                        position: {
                            x: 1420,
                            y: 250
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
                        variable: "Not_Discounted",
                        unit: "",
                        expression: "sum(Cost_over_10_Years)"
                    },
                    visualization: {
                        title: "Not Discounted",
                        position: {
                            x: 1420,
                            y: 410
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
            name: "Discount over 10 Years",
            description: "This example model calculates discounted costs over 10 years.",
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
