import { ModelFileState } from "../io";

/* eslint-disable max-len */

export const getAppleAgroforestExampleModelFile = (): ModelFileState => {
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
                        variable: "Sheep_Income",
                        distribution: "posnorm",
                        lower: 3000,
                        upper: 5000,
                        comment: "",
                        isModifiable: true,
                        lowerBounds: [1000, 5000],
                        upperBounds: [2000, 10000],
                        rangeStep: 1000
                    },
                    visualization: {
                        title: "Sheep Income",
                        position: {
                            x: 200,
                            y: 50
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
                    id: "2",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: null,
                    function: {
                        type: "estimate",
                        variable: "Apple_Income",
                        distribution: "posnorm",
                        lower: 30000,
                        upper: 60000,
                        comment: "",
                        isModifiable: true,
                        lowerBounds: [10000, 50000],
                        upperBounds: [30000, 90000],
                        rangeStep: 10000
                    },
                    visualization: {
                        title: "Apple Income",
                        position: {
                            x: 200,
                            y: -30
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
                        type: "estimate",
                        variable: "Sheep_Cost",
                        distribution: "posnorm",
                        lower: 1000,
                        upper: 2500,
                        comment: "",
                        isModifiable: true,
                        lowerBounds: [100, 2000],
                        upperBounds: [1000, 5000],
                        rangeStep: 100
                    },
                    visualization: {
                        title: "Sheep Cost",
                        position: {
                            x: 200,
                            y: 220
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
                    id: "4",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: null,
                    function: {
                        type: "estimate",
                        variable: "Apple_Cost",
                        distribution: "posnorm",
                        lower: 15000,
                        upper: 30000,
                        comment: "",
                        isModifiable: true,
                        lowerBounds: [5000, 30000],
                        upperBounds: [10000, 50000],
                        rangeStep: 1000
                    },
                    visualization: {
                        title: "Apple Cost",
                        position: {
                            x: 200,
                            y: 140
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
                    id: "5",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: null,
                    function: {
                        type: "estimate",
                        variable: "Discount_Rate",
                        distribution: "posnorm",
                        lower: 9,
                        upper: 11,
                        comment: "",
                        isModifiable: true,
                        lowerBounds: [1, 15],
                        upperBounds: [5, 20],
                        rangeStep: 1
                    },
                    visualization: {
                        title: "Discount Rate",
                        position: {
                            x: 200,
                            y: -190
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
                    id: "8",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: null,
                    function: {
                        type: "result",
                        variable: "Both_Gain_NPV",
                        expression:
                            "discount(\n  vv(Sheep_Income + Apple_Income - Sheep_Cost - Apple_Cost, 0, Years), \n  Discount_Rate,\n  TRUE\n)"
                    },
                    visualization: {
                        title: "Both Gain NPV",
                        position: {
                            x: 630,
                            y: -30
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
                    id: "9",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: null,
                    function: {
                        type: "result",
                        variable: "Sheep_Only_Gain_NPV",
                        expression:
                            "discount(\n  vv(Sheep_Income - Sheep_Cost, 0, Years), \n  Discount_Rate,\n  TRUE\n)"
                    },
                    visualization: {
                        title: "Sheep Only Gain NPV",
                        position: {
                            x: 630,
                            y: 50
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
                    id: "10",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: null,
                    function: {
                        type: "result",
                        variable: "Decision_Benefit",
                        expression: "Both_Gain_NPV - Sheep_Only_Gain_NPV"
                    },
                    visualization: {
                        title: "Decision Benefit",
                        position: {
                            x: 990,
                            y: 10
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
                    id: "11",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: null,
                    function: {
                        type: "estimate",
                        variable: "Years",
                        distribution: "const",
                        lower: 10,
                        upper: 10,
                        comment: "",
                        isModifiable: true,
                        lowerBounds: [5, 20],
                        upperBounds: [5, 20],
                        rangeStep: 1
                    },
                    visualization: {
                        title: "Years",
                        position: {
                            x: 200,
                            y: -110
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
                }
            ],
            edges: []
        },
        metadata: {
            name: "Apple Agroforestry",
            description:
                "This model investigates the decision of whether to add an apple agroforestry. It is based on the Seminar 6 Part 1 of the lecture 'Decision Analysis and Forecasting for Agricultural Development' by Cory Whitney and Eike Luedeling, see: \n\nhttps://agtools.app/decision_analysis/#section-model_programming",
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
            edgeStyle: "bezier",
            background: "dots",
            autoAddComputationEdges: true
        }
    };
};
