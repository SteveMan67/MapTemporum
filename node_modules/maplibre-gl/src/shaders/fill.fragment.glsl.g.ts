// This file is generated. Edit build/generate-shaders.ts, then run `npm run codegen`.
export default '#pragma mapbox: define highp vec4 color\n#pragma mapbox: define lowp float opacity\nvoid main() {\n#pragma mapbox: initialize highp vec4 color\n#pragma mapbox: initialize lowp float opacity\nfragColor=color*opacity;\n#ifdef OVERDRAW_INSPECTOR\nfragColor=vec4(1.0);\n#endif\n}';
