// This file is generated. Edit build/generate-shaders.ts, then run `npm run codegen`.
export default 'uniform vec2 u_fill_translate;in vec2 a_pos;\n#pragma mapbox: define highp vec4 color\n#pragma mapbox: define lowp float opacity\nvoid main() {\n#pragma mapbox: initialize highp vec4 color\n#pragma mapbox: initialize lowp float opacity\ngl_Position=projectTile(a_pos+u_fill_translate,a_pos);}';
