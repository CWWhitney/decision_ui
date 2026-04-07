import { Position } from "../editor";
import { Graph } from "./base";
import { Edge, getEdgeIdForNodes } from "./edge";
import { Node, SubgraphId } from "./node";

export const makeDistinctNodeIdsInGraph = (
    graph: Graph,
    minNodeId: string,
    rootSubgraphId: SubgraphId | null = null
): Graph => {
    const nodeIdMap = Object.fromEntries(graph.nodes.map((n, i) => [n.id, `${parseInt(minNodeId) + i}`]));

    const updateNode = (node: Node): Node => ({
        ...node,
        id: nodeIdMap[node.id],
        nodeParentId: node.nodeParentId ? nodeIdMap[node.nodeParentId] : null,
        subgraphParentId: node.subgraphParentId ? nodeIdMap[node.subgraphParentId] : rootSubgraphId
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
                            x: node.visualization.position.x + (node.nodeParentId == null ? offset.x : 0),
                            y: node.visualization.position.y + (node.nodeParentId == null ? offset.y : 0)
                        }
                    }
                }) as Node
        ),
        edges: [...graph.edges]
    };
};
