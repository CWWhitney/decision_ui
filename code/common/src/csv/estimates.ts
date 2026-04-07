import { parse } from "csv-parse";
import { ESTIMATE_FUNCTION_TYPE, EstimateNode, Node, VARIABLE_NODE_TYPE } from "../graph";
import {
    DETERMINISTIC_DISTRIBUTION_TYPE,
    DISTRIBUTION_TYPES,
    DistributionType,
    generateVariableName
} from "../compute";

export const ESTIMATES_CSV_LABEL_HEADER = "label";
export const ESTIMATES_CSV_VARIABLE_HEADER = "variable";
export const ESTIMATES_CSV_DISTRIBUTION_HEADER = "distribution";
export const ESTIMATES_CSV_LOWER_HEADER = "lower";
export const ESTIMATES_CSV_UPPER_HEADER = "upper";
export const ESTIMATES_CSV_COMMENT_HEADER = "comment";
export const ESTIMATES_CSV_NODE_HEADER = "node";

export interface EstimatesTableRow {
    label: string;
    variable: string;
    distribution: string;
    lower: number;
    upper: number;
    comment: string;
    node: string;
}

export type EstimatesTableColumn = keyof EstimatesTableRow;

export type EstimatesTableData = EstimatesTableRow[];

export const ESTIMATES_CSV_HEADER: (keyof EstimatesTableRow)[] = [
    ESTIMATES_CSV_LABEL_HEADER,
    ESTIMATES_CSV_VARIABLE_HEADER,
    ESTIMATES_CSV_DISTRIBUTION_HEADER,
    ESTIMATES_CSV_LOWER_HEADER,
    ESTIMATES_CSV_UPPER_HEADER,
    ESTIMATES_CSV_COMMENT_HEADER,
    ESTIMATES_CSV_NODE_HEADER
];

export const UPDATEDABLE_ESTIMATE_FIELDS: EstimatesTableColumn[] = [
    ESTIMATES_CSV_LABEL_HEADER,
    ESTIMATES_CSV_VARIABLE_HEADER,
    ESTIMATES_CSV_DISTRIBUTION_HEADER,
    ESTIMATES_CSV_LOWER_HEADER,
    ESTIMATES_CSV_UPPER_HEADER,
    ESTIMATES_CSV_COMMENT_HEADER
];

export const getEstimateTableRowFromNode = (node: EstimateNode) => ({
    label: node.visualization.title,
    variable: node.function.variable,
    distribution: node.function.distribution,
    upper: node.function.upper,
    lower: node.function.lower,
    comment: node.function.comment,
    node: node.id
});

export const generateEstimatesTableFromGraph = (nodes: Node[]): EstimatesTableData => {
    const rows: EstimatesTableData = [];
    for (const node of nodes) {
        if (node.type == VARIABLE_NODE_TYPE && node.function.type == ESTIMATE_FUNCTION_TYPE) {
            rows.push(getEstimateTableRowFromNode(node as EstimateNode));
        }
    }
    return rows.sort((r1, r2) => r1.label.localeCompare(r2.label));
};

export const updateNodeFromEstimateTableEdit = (
    node: EstimateNode,
    column: EstimatesTableColumn,
    value: string,
    row: EstimatesTableRow
) => {
    if (column == ESTIMATES_CSV_LABEL_HEADER) {
        node.visualization.title = value;
    } else if (column == ESTIMATES_CSV_VARIABLE_HEADER) {
        node.function.variable = generateVariableName(value);
    } else if (column == ESTIMATES_CSV_DISTRIBUTION_HEADER) {
        if (DISTRIBUTION_TYPES.includes(value as DistributionType)) {
            node.function.distribution = value as DistributionType;
        } else {
            throw Error(`unknown distribution ${value}`);
        }
    } else if (column == ESTIMATES_CSV_LOWER_HEADER) {
        if (row.distribution == DETERMINISTIC_DISTRIBUTION_TYPE) {
            node.function.lower = parseFloat(value);
            node.function.upper = parseFloat(value);
        } else {
            node.function.lower = parseFloat(value);
        }
    } else if (column == ESTIMATES_CSV_UPPER_HEADER) {
        if (row.distribution == DETERMINISTIC_DISTRIBUTION_TYPE) {
            node.function.lower = parseFloat(value);
            node.function.upper = parseFloat(value);
        } else {
            node.function.upper = parseFloat(value);
        }
    } else if (column == ESTIMATES_CSV_COMMENT_HEADER) {
        node.function.comment = value;
    } else {
        throw Error(`unknown table column "${column}", cannot update estimate node`);
    }
};

export const convertEstimatesToCSV = (rows: EstimatesTableData) => {
    const replaceNull = (key: string, value: any) => (value === null ? "" : value);
    return [
        ESTIMATES_CSV_HEADER.join(","),
        ...rows.map(row =>
            ESTIMATES_CSV_HEADER.map(field => JSON.stringify((row as any)[field], replaceNull)).join(",")
        )
    ].join("\r\n");
};

export const parseEstimatesFromCSV = async (csv: string) => {
    return new Promise<EstimatesTableData>((resolve, reject) => {
        parse(
            csv,
            {
                skip_empty_lines: true,
                columns: ESTIMATES_CSV_HEADER,
                delimiter: ",",
                quote: '"',
                encoding: "utf8"
            },
            (err, records) => {
                if (err) {
                    return reject(err);
                }

                const table: EstimatesTableData = [];
                for (const row of records) {
                    table.push(row as EstimatesTableRow);
                }

                return resolve(table);
            }
        );
    });
};
