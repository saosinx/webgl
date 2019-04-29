attribute vec4 a_Position;
attribute vec4 a_Color;

uniform mat4 u_MvpMatrix;
uniform mat4 u_ModelMatrix;
uniform mat4 u_NormalMatrix;

uniform float u_Height;
uniform float u_Width;

varying vec4 v_Color;
varying vec3 v_Normal;
varying vec3 v_Position;

void main(void) {
	float widthFixer = u_Height / u_Width;
	gl_PointSize = 1.95;

	gl_Position = u_MvpMatrix * a_Position;
	gl_Position = vec4(gl_Position.x * widthFixer, gl_Position.yzw);

	v_Position = vec3(u_ModelMatrix * a_Position);
	v_Normal = normalize(vec3(u_NormalMatrix * a_Position));

	v_Color = a_Position;
	// v_Color = vec4(0.8, 0.0, 0.0, 1.0);
}