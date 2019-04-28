precision mediump float;

uniform vec3 u_LightPosition;

varying vec4 v_Color;
varying vec3 v_Normal;
varying vec3 v_Position;

void main(void) {
	vec3 normal = normalize(v_Normal);
	vec3 lightDirection = normalize(u_LightPosition - v_Position);
	float nDotL = max(dot(lightDirection, normal), 0.0);
	vec3 diffuse = vec3(1.0, 1.0, 1.0) * v_Color.rgb * nDotL;
	vec3 ambient = vec3(0.025, 0.025, 0.025) * v_Color.rgb;

	// gl_FragColor = vec4(diffuse + ambient, 1.0);
	gl_FragColor = vec4(abs(v_Color.xyz), 1.0);
}