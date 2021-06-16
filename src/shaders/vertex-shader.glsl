attribute vec4 a_Position;
attribute vec2 a_TexCoord;
attribute vec4 a_Color;

uniform mat4 u_Transform;

varying vec4 v_Color;
varying vec2 v_TexCoord;

void main() {
	gl_Position = u_Transform * a_Position;
	v_Color = a_Color;
	v_TexCoord = a_TexCoord;
}