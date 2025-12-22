// This file is generated. Edit build/generate-style-code.ts, then run 'npm run codegen'.
/* eslint-disable */

import {latest as styleSpec} from '@maplibre/maplibre-gl-style-spec';

import {
    Properties,
    DataConstantProperty,
    DataDrivenProperty,
    CrossFadedDataDrivenProperty,
    CrossFadedProperty,
    ColorRampProperty,
    PossiblyEvaluatedPropertyValue,
    CrossFaded
} from '../properties';

import type {Color, Formatted, Padding, NumberArray, ColorArray, ResolvedImage, VariableAnchorOffsetCollection} from '@maplibre/maplibre-gl-style-spec';
import {StylePropertySpecification} from '@maplibre/maplibre-gl-style-spec';


export type ColorReliefPaintProps = {
    "color-relief-opacity": DataConstantProperty<number>,
    "color-relief-color": ColorRampProperty,
};

export type ColorReliefPaintPropsPossiblyEvaluated = {
    "color-relief-opacity": number,
    "color-relief-color": ColorRampProperty,
};

let paint: Properties<ColorReliefPaintProps>;
const getPaint = () => paint = paint || new Properties({
    "color-relief-opacity": new DataConstantProperty(styleSpec["paint_color-relief"]["color-relief-opacity"] as any as StylePropertySpecification),
    "color-relief-color": new ColorRampProperty(styleSpec["paint_color-relief"]["color-relief-color"] as any as StylePropertySpecification),
});

export default ({ get paint() { return getPaint() } });