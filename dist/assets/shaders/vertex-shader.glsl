attribute vec4 a_Position;
attribute vec4 a_Normal;
attribute vec4 a_Color;

uniform mat4 u_MvpMatrix;
uniform vec3 u_LightColor;
uniform vec3 u_LightDirection;
uniform float u_Height;
uniform float u_Width;

varying vec4 v_Color;

void main(void) {
	float widthFixer = u_Height / u_Width;
	gl_Position = u_MvpMatrix * a_Position;
	gl_Position = vec4(gl_Position.x * widthFixer, gl_Position.yzw);

	vec3 normal = normalize(vec3(a_Normal));
	float angleLightNormal = max(dot(u_LightDirection, normal), 0.04);
	vec3 diffuse = u_LightColor * vec3(a_Color) * angleLightNormal;
	v_Color = vec4(diffuse, a_Color.a);
}