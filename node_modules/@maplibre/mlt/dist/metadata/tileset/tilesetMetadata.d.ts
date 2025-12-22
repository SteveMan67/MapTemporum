export declare const ColumnScope: {
    readonly FEATURE: 0;
    readonly VERTEX: 1;
};
export declare const ScalarType: {
    readonly BOOLEAN: 0;
    readonly INT_8: 1;
    readonly UINT_8: 2;
    readonly INT_32: 3;
    readonly UINT_32: 4;
    readonly INT_64: 5;
    readonly UINT_64: 6;
    readonly FLOAT: 7;
    readonly DOUBLE: 8;
    readonly STRING: 9;
};
export declare const ComplexType: {
    readonly GEOMETRY: 0;
    readonly STRUCT: 1;
};
export declare const LogicalScalarType: {
    readonly ID: 0;
};
export declare const LogicalComplexType: {
    readonly BINARY: 0;
    readonly RANGE_MAP: 1;
};
export interface TileSetMetadata {
    version?: number | null;
    featureTables: FeatureTableSchema[];
    name?: string | null;
    description?: string | null;
    attribution?: string | null;
    minZoom?: number | null;
    maxZoom?: number | null;
    bounds: number[];
    center: number[];
}
export interface FeatureTableSchema {
    name?: string | null;
    columns: Column[];
}
export interface Column {
    name?: string | null;
    nullable?: boolean | null;
    columnScope?: number | null;
    scalarType?: ScalarColumn | null;
    complexType?: ComplexColumn | null;
    type?: "scalarType" | "complexType";
}
export interface ScalarColumn {
    longID?: boolean | null;
    physicalType?: number | null;
    logicalType?: number | null;
    type?: "physicalType" | "logicalType";
}
export interface ComplexColumn {
    physicalType?: number | null;
    logicalType?: number | null;
    children: Field[];
    type?: "physicalType" | "logicalType";
}
export interface Field {
    name?: string | null;
    nullable?: boolean | null;
    scalarField?: ScalarField | null;
    complexField?: ComplexField | null;
    type?: "scalarField" | "complexField";
}
export interface ScalarField {
    physicalType?: number | null;
    logicalType?: number | null;
    type?: "physicalType" | "logicalType";
}
export interface ComplexField {
    physicalType?: number | null;
    logicalType?: number | null;
    children: Field[];
    type?: "physicalType" | "logicalType";
}
