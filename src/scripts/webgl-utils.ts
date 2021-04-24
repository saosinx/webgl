import fragmentShader from '../shaders/fragment-shader.glsl'
import vertexShader from '../shaders/vertex-shader.glsl'
import { Shader } from './constants'

const parseImport = (str: string) => JSON.parse(str.replace('module.exports = ', ''))

/**
 * Creates a program, attaches shaders, binds attrib locations, links the
 * program and calls useProgram.
 * @param {WebGLShader[]} shaders The shaders to attach
 * @param {string[]} [opt_attribs] An array of attribs names.
 * Locations will be assigned by index if not passed in
 * @param {number[]} [opt_locations] The locations for the.
 * A parallel array to opt_attribs letting you assign locations.
 * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors.
 * By default it just prints an error to the console on error.
 * If you want something else pass an callback. It's passed an error message.
 * @memberOf module:webgl-utils
 */
export const createProgram = (
	gl: WebGLRenderingContext,
	shaders: WebGLShader[],
	opt_attribs?: string[],
	opt_locations?: number[],
	opt_errorCallback?: any
) => {
	const errFn: (errorMessage: string) => void | Console = opt_errorCallback || console.error
	const program = gl.createProgram()

	shaders.forEach(shader => gl.attachShader(program, shader))

	if (opt_attribs) {
		opt_attribs.forEach((attrib, ndx) =>
			gl.bindAttribLocation(program, opt_locations ? opt_locations[ndx] : ndx, attrib)
		)
	}

	gl.linkProgram(program)

	// Check the link status
	const linked = gl.getProgramParameter(program, gl.LINK_STATUS)
	if (!linked) {
		// something went wrong with the link
		const lastError = gl.getProgramInfoLog(program)
		errFn('Error in program linking:' + lastError)

		gl.deleteProgram(program)
		return null
	}

	return program
}

export const createShader = (gl: WebGLRenderingContext, type: Shader) => {
	const compileShader = (shader: WebGLShader, source: string) => {
		gl.shaderSource(shader, parseImport(source))
		gl.compileShader(shader)
		return shader
	}

	const createFragmentShader = () => compileShader(gl.createShader(gl.FRAGMENT_SHADER), fragmentShader)
	const createVertexShader = () => compileShader(gl.createShader(gl.VERTEX_SHADER), vertexShader)

	switch (type) {
		case Shader.Fragment:
			return createFragmentShader()
		case Shader.Vertex:
			return createVertexShader()
		default:
			return null
	}
}

export const resizeCanvasToDisplaySize = (canvas: HTMLCanvasElement, multiplier = 1) => {
	const width = (canvas.clientWidth * multiplier) | 0
	const height = (canvas.clientHeight * multiplier) | 0

	if (canvas.width !== width || canvas.height !== height) {
		canvas.width = width
		canvas.height = height
		return true
	}

	return false
}

export const resizeCanvasToSquare = (canvas: HTMLCanvasElement) => {
	const styles = getComputedStyle(canvas)
	const width = parseFloat(styles.width)
	const height = parseFloat(styles.height)

	if (canvas.width !== width || canvas.height !== height) {
		canvas.width = width
		canvas.height = width
		return true
	}

	return false
}
