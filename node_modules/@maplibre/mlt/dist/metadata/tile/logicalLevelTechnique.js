export var LogicalLevelTechnique;
(function (LogicalLevelTechnique) {
    LogicalLevelTechnique["NONE"] = "NONE";
    LogicalLevelTechnique["DELTA"] = "DELTA";
    LogicalLevelTechnique["COMPONENTWISE_DELTA"] = "COMPONENTWISE_DELTA";
    LogicalLevelTechnique["RLE"] = "RLE";
    LogicalLevelTechnique["MORTON"] = "MORTON";
    // Pseudodecimal Encoding of floats -> only for the exponent integer part an additional logical level technique is used.
    // Both exponent and significant parts are encoded with the same physical level technique
    LogicalLevelTechnique["PDE"] = "PDE";
})(LogicalLevelTechnique || (LogicalLevelTechnique = {}));
//# sourceMappingURL=logicalLevelTechnique.js.map