import { ModelFileState } from "../io";

/* eslint-disable max-len */

export const getWildfireExampleModelFile = (): ModelFileState => {
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
                        variable: "n_years",
                        distribution: "const",
                        lower: 20,
                        upper: 20,
                        comment: "total number of years to simulate",
                        isModifiable: true,
                        lowerBounds: [5, 30],
                        upperBounds: [5, 30],
                        rangeStep: 1
                    },
                    visualization: {
                        autoConnect: false,
                        title: "n_years",
                        position: {
                            x: 1330,
                            y: 250
                        },
                        size: {
                            width: 200,
                            height: 50
                        },
                        style: {
                            type: "generic"
                        }
                    }
                },
                {
                    id: "2",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: null,
                    function: {
                        type: "estimate",
                        variable: "area_size",
                        distribution: "const",
                        lower: 1,
                        upper: 1,
                        comment: "total forest area considered in the analysis",
                        isModifiable: true,
                        lowerBounds: [1, 100],
                        upperBounds: [1, 100],
                        rangeStep: 1
                    },
                    visualization: {
                        autoConnect: true,
                        title: "area_size",
                        position: {
                            x: 1330,
                            y: 580
                        },
                        size: {
                            width: 210,
                            height: 50
                        },
                        style: {
                            type: "generic"
                        }
                    }
                },
                {
                    id: "3",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: "38",
                    function: {
                        type: "estimate",
                        variable: "initial_biomass",
                        distribution: "posnorm",
                        lower: 20,
                        upper: 100,
                        comment: "starting biomass level of the forest at the beginning of the simulation",
                        isModifiable: true,
                        lowerBounds: [10, 30],
                        upperBounds: [50, 200],
                        rangeStep: 1
                    },
                    visualization: {
                        autoConnect: true,
                        title: "initial_biomass",
                        position: {
                            x: 520,
                            y: 198.75
                        },
                        size: {
                            width: 250,
                            height: 50
                        },
                        style: {
                            type: "generic"
                        }
                    }
                },
                {
                    id: "4",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: "38",
                    function: {
                        type: "estimate",
                        variable: "biomass_after_burning",
                        distribution: "posnorm",
                        lower: 10,
                        upper: 20,
                        comment: "biomass level immediately after a controlled (prescribed) burn",
                        isModifiable: true,
                        lowerBounds: [5, 20],
                        upperBounds: [10, 30],
                        rangeStep: 1
                    },
                    visualization: {
                        autoConnect: true,
                        title: "biomass_after_burning",
                        position: {
                            x: 520,
                            y: 268.75
                        },
                        size: {
                            width: 250,
                            height: 50
                        },
                        style: {
                            type: "generic"
                        }
                    }
                },
                {
                    id: "5",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: "38",
                    function: {
                        type: "estimate",
                        variable: "biomass_after_severe_fire",
                        distribution: "posnorm",
                        lower: 2,
                        upper: 5,
                        comment: "biomass level remaining after a severe wildfire event",
                        isModifiable: true,
                        lowerBounds: [1, 3],
                        upperBounds: [3, 10],
                        rangeStep: 1
                    },
                    visualization: {
                        autoConnect: true,
                        title: "biomass_after_severe_fire",
                        position: {
                            x: 520,
                            y: 338.75
                        },
                        size: {
                            width: 250,
                            height: 50
                        },
                        style: {
                            type: "generic"
                        }
                    }
                },
                {
                    id: "6",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: "38",
                    function: {
                        type: "estimate",
                        variable: "biomass_after_mild_fire",
                        distribution: "posnorm",
                        lower: 10,
                        upper: 20,
                        comment: "biomass level remaining after a mild wildfire event",
                        isModifiable: true,
                        lowerBounds: [5, 20],
                        upperBounds: [10, 30],
                        rangeStep: 1
                    },
                    visualization: {
                        autoConnect: true,
                        title: "biomass_after_mild_fire",
                        position: {
                            x: 520,
                            y: 408.75
                        },
                        size: {
                            width: 250,
                            height: 50
                        },
                        style: {
                            type: "generic"
                        }
                    }
                },
                {
                    id: "7",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: "38",
                    function: {
                        type: "estimate",
                        variable: "bio_accu_rate_contr_burn",
                        distribution: "posnorm",
                        lower: 10,
                        upper: 40,
                        comment: "annual biomass accumulation rate following controlled burning (in percent)",
                        isModifiable: true,
                        lowerBounds: [5, 20],
                        upperBounds: [30, 50],
                        rangeStep: 1
                    },
                    visualization: {
                        autoConnect: true,
                        title: "bio_accu_rate_contr_burn",
                        position: {
                            x: 520,
                            y: 478.75
                        },
                        size: {
                            width: 250,
                            height: 50
                        },
                        style: {
                            type: "generic"
                        }
                    }
                },
                {
                    id: "8",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: "38",
                    function: {
                        type: "estimate",
                        variable: "bio_accu_rate_no_contr_burn",
                        distribution: "posnorm",
                        lower: 40,
                        upper: 100,
                        comment: "annual biomass accumulation rate without controlled burning (in percent)",
                        isModifiable: true,
                        lowerBounds: [30, 50],
                        upperBounds: [80, 120],
                        rangeStep: 1
                    },
                    visualization: {
                        autoConnect: true,
                        title: "bio_accu_rate_no_contr_burn",
                        position: {
                            x: 520,
                            y: 548.75
                        },
                        size: {
                            width: 250,
                            height: 50
                        },
                        style: {
                            type: "generic"
                        }
                    }
                },
                {
                    id: "9",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: "38",
                    function: {
                        type: "estimate",
                        variable: "severity_threshold",
                        distribution: "posnorm",
                        lower: 50,
                        upper: 120,
                        comment: "biomass level above which a wildfire is considered severe",
                        isModifiable: true,
                        lowerBounds: [40, 60],
                        upperBounds: [100, 140],
                        rangeStep: 1
                    },
                    visualization: {
                        autoConnect: true,
                        title: "severity_threshold",
                        position: {
                            x: 520,
                            y: 620
                        },
                        size: {
                            width: 250,
                            height: 50
                        },
                        style: {
                            type: "generic"
                        }
                    }
                },
                {
                    id: "10",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: "36",
                    function: {
                        type: "estimate",
                        variable: "discount_rate",
                        distribution: "posnorm",
                        lower: 2,
                        upper: 6,
                        comment: "annual discount rate used to calculate net present value (in percent)",
                        isModifiable: true,
                        lowerBounds: [1, 3],
                        upperBounds: [4, 8],
                        rangeStep: 1
                    },
                    visualization: {
                        autoConnect: true,
                        title: "discount_rate",
                        position: {
                            x: 1890,
                            y: 310
                        },
                        size: {
                            width: 250,
                            height: 50
                        },
                        style: {
                            type: "generic"
                        }
                    }
                },
                {
                    id: "11",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: "37",
                    function: {
                        type: "estimate",
                        variable: "controlled_burning_frequency",
                        distribution: "const",
                        lower: 2,
                        upper: 2,
                        comment: "interval at which controlled burning is conducted (in years)",
                        isModifiable: true,
                        lowerBounds: [1, 3],
                        upperBounds: [1, 3],
                        rangeStep: 1
                    },
                    visualization: {
                        autoConnect: true,
                        title: "controlled_burning_frequency",
                        position: {
                            x: 530,
                            y: 850
                        },
                        size: {
                            width: 250,
                            height: 50
                        },
                        style: {
                            type: "generic"
                        }
                    }
                },
                {
                    id: "12",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: "37",
                    function: {
                        type: "estimate",
                        variable: "fire_risk",
                        distribution: "tnorm_0_1",
                        lower: 0.1,
                        upper: 0.25,
                        comment: "annual probability that a wildfire occurs",
                        isModifiable: true,
                        lowerBounds: [0.05, 0.2],
                        upperBounds: [0.1, 0.4],
                        rangeStep: 0.05
                    },
                    visualization: {
                        autoConnect: true,
                        title: "fire_risk",
                        position: {
                            x: 530,
                            y: 690
                        },
                        size: {
                            width: 250,
                            height: 50
                        },
                        style: {
                            type: "risk"
                        }
                    }
                },
                {
                    id: "13",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: "35",
                    function: {
                        type: "estimate",
                        variable: "cost_of_controlled_burning",
                        distribution: "posnorm",
                        lower: 300,
                        upper: 1000,
                        comment: "cost per controlled burn treatment per year",
                        isModifiable: true,
                        lowerBounds: [100, 500],
                        upperBounds: [500, 2000],
                        rangeStep: 1
                    },
                    visualization: {
                        autoConnect: true,
                        title: "cost_of_controlled_burning",
                        position: {
                            x: 1280,
                            y: 910
                        },
                        size: {
                            width: 250,
                            height: 50
                        },
                        style: {
                            type: "cost"
                        }
                    }
                },
                {
                    id: "14",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: "34",
                    function: {
                        type: "estimate",
                        variable: "env_imp_severe_fire",
                        distribution: "posnorm",
                        lower: 1000,
                        upper: 6000,
                        comment: "environmental damage cost associated with a severe wildfire",
                        isModifiable: true,
                        lowerBounds: [500, 1500],
                        upperBounds: [4000, 8000],
                        rangeStep: 1
                    },
                    visualization: {
                        autoConnect: true,
                        title: "env_imp_severe_fire",
                        position: {
                            x: 1580,
                            y: 620
                        },
                        size: {
                            width: 250,
                            height: 50
                        },
                        style: {
                            type: "cost"
                        }
                    }
                },
                {
                    id: "15",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: "34",
                    function: {
                        type: "estimate",
                        variable: "env_imp_mild_fire",
                        distribution: "norm",
                        lower: -500,
                        upper: 800,
                        comment: "environmental damage cost associated with a mild wildfire",
                        isModifiable: true,
                        lowerBounds: [-1000, 0],
                        upperBounds: [400, 1200],
                        rangeStep: 1
                    },
                    visualization: {
                        autoConnect: true,
                        title: "env_imp_mild_fire",
                        position: {
                            x: 1580,
                            y: 530
                        },
                        size: {
                            width: 250,
                            height: 50
                        },
                        style: {
                            type: "cost"
                        }
                    }
                },
                {
                    id: "16",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: "33",
                    function: {
                        type: "estimate",
                        variable: "fire_fighting_cost_mild_fire",
                        distribution: "posnorm",
                        lower: 100,
                        upper: 500,
                        comment: "firefighting cost incurred when a mild wildfire occurs",
                        isModifiable: true,
                        lowerBounds: [50, 150],
                        upperBounds: [250, 1000],
                        rangeStep: 1
                    },
                    visualization: {
                        autoConnect: true,
                        title: "fire_fighting_cost_mild_fire",
                        position: {
                            x: 1580,
                            y: 790
                        },
                        size: {
                            width: 250,
                            height: 50
                        },
                        style: {
                            type: "cost"
                        }
                    }
                },
                {
                    id: "17",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: "33",
                    function: {
                        type: "estimate",
                        variable: "fire_fighting_cost_severe_fire",
                        distribution: "posnorm",
                        lower: 1000,
                        upper: 10000,
                        comment: "firefighting cost incurred when a severe wildfire occurs",
                        isModifiable: true,
                        lowerBounds: [500, 1500],
                        upperBounds: [5000, 15000],
                        rangeStep: 1
                    },
                    visualization: {
                        autoConnect: true,
                        title: "fire_fighting_cost_severe_fire",
                        position: {
                            x: 1580,
                            y: 710
                        },
                        size: {
                            width: 250,
                            height: 50
                        },
                        style: {
                            type: "cost"
                        }
                    }
                },
                {
                    id: "18",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: "37",
                    function: {
                        type: "operation",
                        variable: "Fire",
                        expression: "chance_event(fire_risk, 1, 0, n_years)"
                    },
                    visualization: {
                        autoConnect: true,
                        title: "Fire",
                        position: {
                            x: 880,
                            y: 690
                        },
                        size: {
                            width: 200,
                            height: 50
                        },
                        style: {
                            type: "risk"
                        }
                    }
                },
                {
                    id: "19",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: "37",
                    function: {
                        type: "loop",
                        variable: "Controlled",
                        iterationsExpression: "n_years",
                        initExpression: "0",
                        loopExpression: "i % controlled_burning_frequency == 0"
                    },
                    visualization: {
                        autoConnect: true,
                        title: "Controlled",
                        position: {
                            x: 880,
                            y: 850
                        },
                        size: {
                            width: 200,
                            height: 50
                        },
                        style: {
                            type: "generic"
                        }
                    }
                },
                {
                    id: "20",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: "38",
                    function: {
                        type: "loop",
                        variable: "No_Control_Biomass",
                        iterationsExpression: "n_years",
                        initExpression: "initial_biomass",
                        loopExpression:
                            "(1-Fire[i]) * previous * (1 + bio_accu_rate_no_contr_burn/100) \n+ Fire[i] * (previous >= severity_threshold) * biomass_after_severe_fire \n+ Fire[i] * (previous < severity_threshold) * biomass_after_mild_fire"
                    },
                    visualization: {
                        autoConnect: true,
                        title: "No Control Biomass",
                        position: {
                            x: 1120,
                            y: 300
                        },
                        size: {
                            width: 200,
                            height: 50
                        },
                        style: {
                            type: "generic"
                        }
                    }
                },
                {
                    id: "21",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: "38",
                    function: {
                        type: "loop",
                        variable: "Control_Biomass",
                        iterationsExpression: "n_years",
                        initExpression: "initial_biomass",
                        loopExpression:
                            "(1-Controlled[i]) * (1-Fire[i]) * previous * (1 + bio_accu_rate_no_contr_burn/100) \n+ Controlled[i] * biomass_after_burning * (1 + bio_accu_rate_contr_burn/100) \n+ (1-Controlled[i]) * Fire[i] * (previous >= severity_threshold) * biomass_after_severe_fire \n+ (1-Controlled[i]) * Fire[i] * (previous < severity_threshold) * biomass_after_mild_fire"
                    },
                    visualization: {
                        autoConnect: true,
                        title: "Control Biomass",
                        position: {
                            x: 1120,
                            y: 480
                        },
                        size: {
                            width: 200,
                            height: 50
                        },
                        style: {
                            type: "generic"
                        }
                    }
                },
                {
                    id: "22",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: "33",
                    function: {
                        type: "loop",
                        variable: "No_Control_Firefighting_Cost",
                        iterationsExpression: "n_years",
                        initExpression: "0",
                        loopExpression:
                            "Fire[i] * (No_Control_Biomass[i-1] >= severity_threshold) * fire_fighting_cost_severe_fire \n+ Fire[i] * (No_Control_Biomass[i-1] < severity_threshold) * fire_fighting_cost_mild_fire"
                    },
                    visualization: {
                        autoConnect: true,
                        title: "No Control Firefighting Cost",
                        position: {
                            x: 1970,
                            y: 710
                        },
                        size: {
                            width: 280,
                            height: 50
                        },
                        style: {
                            type: "cost"
                        }
                    }
                },
                {
                    id: "23",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: "34",
                    function: {
                        type: "loop",
                        variable: "No_Control_Environment_Costs",
                        iterationsExpression: "n_years",
                        initExpression: "0",
                        loopExpression:
                            "Fire[i] * (No_Control_Biomass[i-1] >= severity_threshold) * env_imp_severe_fire \n+ Fire[i] * (No_Control_Biomass[i-1] < severity_threshold) * env_imp_mild_fire"
                    },
                    visualization: {
                        autoConnect: true,
                        title: "No Control Environment Costs",
                        position: {
                            x: 1940,
                            y: 530
                        },
                        size: {
                            width: 280,
                            height: 50
                        },
                        style: {
                            type: "cost"
                        }
                    }
                },
                {
                    id: "24",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: null,
                    function: {
                        type: "operation",
                        variable: "No_Control_Bottom_Line",
                        expression: "-(No_Control_Firefighting_Cost + No_Control_Environment_Costs) * area_size"
                    },
                    visualization: {
                        autoConnect: true,
                        title: "No Control Bottom Line",
                        position: {
                            x: 1330,
                            y: 470
                        },
                        size: {
                            width: 210,
                            height: 50
                        },
                        style: {
                            type: "cost"
                        }
                    }
                },
                {
                    id: "25",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: "35",
                    function: {
                        type: "loop",
                        variable: "Control_Treatment_Costs",
                        iterationsExpression: "n_years",
                        initExpression: "0",
                        loopExpression: "Controlled[i] * cost_of_controlled_burning"
                    },
                    visualization: {
                        autoConnect: true,
                        title: "Control Treatment Costs",
                        position: {
                            x: 1600,
                            y: 910
                        },
                        size: {
                            width: 280,
                            height: 50
                        },
                        style: {
                            type: "cost"
                        }
                    }
                },
                {
                    id: "26",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: "33",
                    function: {
                        type: "loop",
                        variable: "Control_Firefighting_Costs",
                        iterationsExpression: "n_years",
                        initExpression: "0",
                        loopExpression:
                            "(1-Controlled[i]) * Fire[i] * (Control_Biomass[i-1] >= severity_threshold) * fire_fighting_cost_severe_fire \n+ (1-Controlled[i]) * Fire[i] * (Control_Biomass[i-1] < severity_threshold) * fire_fighting_cost_mild_fire"
                    },
                    visualization: {
                        autoConnect: true,
                        title: "Control Firefighting Costs",
                        position: {
                            x: 1970,
                            y: 790
                        },
                        size: {
                            width: 280,
                            height: 50
                        },
                        style: {
                            type: "cost"
                        }
                    }
                },
                {
                    id: "27",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: "34",
                    function: {
                        type: "loop",
                        variable: "Control_Environment_Costs",
                        iterationsExpression: "n_years",
                        initExpression: "0",
                        loopExpression:
                            "(1-Controlled[i]) * Fire[i] * (Control_Biomass[i-1] >= severity_threshold) * env_imp_severe_fire \n+ (1-Controlled[i]) * Fire[i] * (Control_Biomass[i-1] < severity_threshold) * env_imp_mild_fire"
                    },
                    visualization: {
                        autoConnect: true,
                        title: "Control Environment Costs",
                        position: {
                            x: 1940,
                            y: 620
                        },
                        size: {
                            width: 280,
                            height: 50
                        },
                        style: {
                            type: "cost"
                        }
                    }
                },
                {
                    id: "28",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: null,
                    function: {
                        type: "operation",
                        variable: "Control_Bottom_Line",
                        expression:
                            "- (Control_Treatment_Costs + Control_Firefighting_Costs + Control_Environment_Costs) * area_size"
                    },
                    visualization: {
                        autoConnect: true,
                        title: "Control Bottom Line",
                        position: {
                            x: 1330,
                            y: 690
                        },
                        size: {
                            width: 210,
                            height: 50
                        },
                        style: {
                            type: "cost"
                        }
                    }
                },
                {
                    id: "29",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: "36",
                    function: {
                        type: "operation",
                        variable: "Bottom_Line_Difference",
                        expression: "Control_Bottom_Line - No_Control_Bottom_Line"
                    },
                    visualization: {
                        autoConnect: true,
                        title: "Bottom Line Difference",
                        position: {
                            x: 1540,
                            y: 480
                        },
                        size: {
                            width: 200,
                            height: 50
                        },
                        style: {
                            type: "benefit"
                        }
                    }
                },
                {
                    id: "30",
                    type: "variable",
                    nodeParentId: null,
                    subgraphParentId: "36",
                    function: {
                        type: "result",
                        variable: "NPV_Controlled_Burning",
                        expression: "discount(Bottom_Line_Difference, discount_rate, TRUE)"
                    },
                    visualization: {
                        autoConnect: true,
                        title: "NPV Controlled Burning",
                        position: {
                            x: 1910,
                            y: 480
                        },
                        size: {
                            width: 210,
                            height: 50
                        },
                        style: {
                            type: "result"
                        }
                    }
                },
                {
                    id: "33",
                    type: "subgraph",
                    nodeParentId: null,
                    subgraphParentId: null,
                    function: {
                        type: "empty"
                    },
                    visualization: {
                        autoConnect: true,
                        title: "Firefighting Costs",
                        position: {
                            x: 980,
                            y: 370
                        },
                        size: {
                            width: 200,
                            height: 50
                        },
                        style: {
                            type: "cost"
                        }
                    }
                },
                {
                    id: "34",
                    type: "subgraph",
                    nodeParentId: null,
                    subgraphParentId: null,
                    function: {
                        type: "empty"
                    },
                    visualization: {
                        autoConnect: true,
                        title: "Environment Costs",
                        position: {
                            x: 980,
                            y: 560
                        },
                        size: {
                            width: 200,
                            height: 50
                        },
                        style: {
                            type: "cost"
                        }
                    }
                },
                {
                    id: "35",
                    type: "subgraph",
                    nodeParentId: null,
                    subgraphParentId: null,
                    function: {
                        type: "empty"
                    },
                    visualization: {
                        autoConnect: true,
                        title: "Treatment Costs",
                        position: {
                            x: 980,
                            y: 770
                        },
                        size: {
                            width: 200,
                            height: 50
                        },
                        style: {
                            type: "cost"
                        }
                    }
                },
                {
                    id: "36",
                    type: "subgraph",
                    nodeParentId: null,
                    subgraphParentId: null,
                    function: {
                        type: "empty"
                    },
                    visualization: {
                        autoConnect: true,
                        title: "Benefit of Controlled Burning",
                        position: {
                            x: 1680,
                            y: 580
                        },
                        size: {
                            width: 250,
                            height: 50
                        },
                        style: {
                            type: "result"
                        }
                    }
                },
                {
                    id: "37",
                    type: "subgraph",
                    nodeParentId: null,
                    subgraphParentId: null,
                    function: {
                        type: "empty"
                    },
                    visualization: {
                        autoConnect: true,
                        title: "Fire",
                        position: {
                            x: 670,
                            y: 560
                        },
                        size: {
                            width: 200,
                            height: 50
                        },
                        style: {
                            type: "risk"
                        }
                    }
                },
                {
                    id: "38",
                    type: "subgraph",
                    nodeParentId: null,
                    subgraphParentId: null,
                    function: {
                        type: "empty"
                    },
                    visualization: {
                        autoConnect: true,
                        title: "Biomass",
                        position: {
                            x: 670,
                            y: 370
                        },
                        size: {
                            width: 200,
                            height: 50
                        },
                        style: {
                            type: "generic"
                        }
                    }
                }
            ],
            edges: []
        },
        metadata: {
            name: "Wildfire Example",
            description: "This model matches the Wildfire example published at CRAN for the decisionSupport package.",
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
