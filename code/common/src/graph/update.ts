import { Position } from "../editor";
import { Graph } from "./base";
import { Edge, getEdgeIdForNodes } from "./edge";
import { Node } from "./node";

export const makeDistinctNodeIdsInGraph = (graph: Graph, minNodeId: string): Graph => {
    const nodeIdMap = Object.fromEntries(graph.nodes.map((n, i) => [n.id, `${parseInt(minNodeId) + i}`]));

    const updateNode = (node: Node): Node => ({
        ...node,
        id: nodeIdMap[node.id],
        nodeParentId: node.nodeParentId ? nodeIdMap[node.nodeParentId] : null,
        subgraphParentId: node.subgraphParentId ? nodeIdMap[node.subgraphParentId] : null
    });

    const updateEdge = (edge: Edge): Edge => ({
        ...edge,
        id: getEdgeIdForNodes(nodeIdMap[edge.source], nodeIdMap[edge.target]),
        source: nodeIdMap[edge.source],
        target: nodeIdMap[edge.target]
    });

    return {
        nodes: graph.nodes.map(updateNode),
        edges: graph.edges.map(updateEdge)
    };
};

export const moveGraph = (graph: Graph, offset: Position): Graph => {
    return {
        nodes: graph.nodes.map(
            node =>
                ({
                    ...node,
                    visualization: {
                        ...node.visualization,
                        position: {
                            x: node.visualization.position.x + offset.x,
                            y: node.visualization.position.y + offset.y
                        }
                    }
                }) as Node
        ),
        edges: [...graph.edges]
    };
};
