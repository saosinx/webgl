precision mediump float;

varying vec4 v_Color;

void main(void) {
	gl_FragColor = vec4(v_Color.xyz, 1.0);
	// gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}