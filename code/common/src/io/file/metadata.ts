export interface MetadataFileState {
    name: string;
    description: string;
    creationDate: string;
    lastModified: string;
}

export const MetadataFileSchema = {
    type: "object",
    properties: {
        name: { type: "string" },
        description: { type: "string" },
        creationDate: { type: "string" },
        lastModified: { type: "string" }
    },
    required: ["name", "description", "creationDate", "lastModified"]
};
