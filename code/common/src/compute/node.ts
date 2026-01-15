import {
  COLLECTION_NODE_TYPE,
  CollectionNode,
  ESTIMATE_NODE_TYPE,
  EstimateNode,
  LOOP_NODE_TYPE,
  LoopNode,
  Node,
  NodeType,
  OPERATION_NODE_TYPE,
  OperationNode,
  RESULT_NODE_TYPE,
  ResultNode,
} from "../graph";

import { getNormalDistributionSample } from "../math";
import { ComputationContext } from "./context";

import { COMPUTATION_RESULT_VALUE_TYPE, ComputationResult } from "./result";
import { DETERMINISTIC_TYPE, PROBABILISTIC_TYPE } from "./value";

export const getEstimateNodeComputationResult = (
  node: EstimateNode,
  context: ComputationContext
): ComputationResult => {
  if (node.options.distribution == "deterministic") {
    return {
      type: COMPUTATION_RESULT_VALUE_TYPE,
      value: {
        data: node.options.lower,
        type: DETERMINISTIC_TYPE,
        shape: "constant",
      },
    };
  }

  if (node.options.distribution == "norm") {
    return {
      type: COMPUTATION_RESULT_VALUE_TYPE,
      value: {
        data: getNormalDistributionSample(
          node.options.lower,
          node.options.upper,
          context.mcRuns
        ),
        type: PROBABILISTIC_TYPE,
        shape: [context.mcRuns],
      },
    };
  }

  return {
    type: COMPUTATION_RESULT_VALUE_TYPE,
    value: {
      data: node.options.lower,
      type: DETERMINISTIC_TYPE,
      shape: "constant",
    },
  };
};

export const getOperationNodeComputationResult = (
  _node: OperationNode,
  _context: ComputationContext
): ComputationResult => {
  return null;
};

export const getLoopNodeComputationResult = (
  _node: LoopNode,
  _context: ComputationContext
): ComputationResult => {
  return null;
};

export const getResultNodeComputationResult = (
  _node: ResultNode,
  _context: ComputationContext
): ComputationResult => {
  return null;
};

export const getCollectionNodeComputationResult = (
  _node: CollectionNode,
  _context: ComputationContext
): ComputationResult => {
  return null;
};

export const NODE_COMPUTATION_FUNCTIONS: {
  [key in NodeType]: (
    node: Node,
    context: ComputationContext
  ) => ComputationResult;
} = {
  [ESTIMATE_NODE_TYPE]: getEstimateNodeComputationResult,
  [OPERATION_NODE_TYPE]: getOperationNodeComputationResult,
  [LOOP_NODE_TYPE]: getLoopNodeComputationResult,
  [RESULT_NODE_TYPE]: getResultNodeComputationResult,
  [COLLECTION_NODE_TYPE]: getCollectionNodeComputationResult,
};

export const getNodeComputationResult = (
  node: Node,
  context: ComputationContext
): ComputationResult => {
  if (node.type in NODE_COMPUTATION_FUNCTIONS) {
    return NODE_COMPUTATION_FUNCTIONS[node.type](
      node,
      context
    ) as ComputationResult;
  }
  return {
    type: "error",
    errors: [`no computation function available for node type '${node.type}'`],
  };
};
