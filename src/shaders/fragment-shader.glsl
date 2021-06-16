precision mediump float;

uniform sampler2D u_Sampler;

varying vec4 v_Color;
varying vec2 v_TexCoord;

float map(float value) { return (value + 1.0) * 0.5; }

void main() {
	// gl_FragColor = v_Color;
	gl_FragColor = texture2D(u_Sampler, v_TexCoord);
}