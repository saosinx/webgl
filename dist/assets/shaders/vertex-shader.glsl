attribute vec4 a_Position;
attribute vec4 a_Color;

uniform mat4 u_MvpMatrix;
uniform float u_Width;
uniform float u_Height;

varying vec4 v_Color;

void main(void) {
	float widthFixer = u_Height / u_Width;
	gl_Position = u_MvpMatrix * a_Position;
	gl_Position = vec4(gl_Position.x * widthFixer, gl_Position.yzw);
	v_Color = a_Color;
}