/*
 * Copyright 2012, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of his
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

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
export function createProgram(
	gl: WebGLRenderingContext,
	shaders: WebGLShader[],
	opt_attribs?: string[],
	opt_locations?: number[],
	opt_errorCallback?: any,
): WebGLProgram {
	const errFn = opt_errorCallback || console.error
	const program: WebGLProgram = gl.createProgram()

	shaders.forEach((shader) => gl.attachShader(program, shader))

	if (opt_attribs) {
		opt_attribs.forEach((attrib, ndx) =>
			gl.bindAttribLocation(program, opt_locations ? opt_locations[ndx] : ndx, attrib),
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

/**
 * Resize a canvas to match the size its displayed.
 * @param {HTMLCanvasElement} canvas The canvas to resize.
 * @param {number} [multiplier] amount to multiply by.
 *    Pass in window.devicePixelRatio for native pixels.
 * @return {boolean} true if the canvas was resized.
 * @memberOf module:webgl-utils
 */
export function resizeCanvasToDisplaySize(
	canvas: HTMLCanvasElement,
	multiplier: number = 1,
): boolean {
	const width = (canvas.clientWidth * multiplier) | 0
	const height = (canvas.clientHeight * multiplier) | 0
	if (canvas.width !== width || canvas.height !== height) {
		canvas.width = width
		canvas.height = height
		return true
	}
	return false
}

/**
 * Resize a canvas to match the size its displayed.
 * @param {HTMLCanvasElement} canvas The canvas to resize.
 * @return {boolean} true if the canvas was resized.
 * @memberOf module:webgl-utils
 */
export function resizeCanvasToSquare(canvas: HTMLCanvasElement): boolean {
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

export function createShader(
	gl: WebGLRenderingContext,
	type: string,
	resolve: (value: WebGLShader | PromiseLike<{}>) => void,
	reject: (reason: Error) => void,
) {
	function handleShader(data: string): WebGLShader {
		let shader: WebGLShader
		if (type === 'fragment-shader') {
			shader = gl.createShader(gl.FRAGMENT_SHADER)
		} else if (type === 'vertex-shader') {
			shader = gl.createShader(gl.VERTEX_SHADER)
		} else {
			return null
		}

		gl.shaderSource(shader, data)
		gl.compileShader(shader)

		return shader
	}

	fetch(`http://localhost:1337/assets/shaders/${type}.glsl`)
		.then((resp) => resp.text())
		.then((data: string) => handleShader(data))
		.then((shader: WebGLShader) => resolve(shader))
		.catch((err: Error) => reject(err))

	// if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
	// 	alert(gl.getShaderInfoLog(shader))
	// 	return null
	// }
}
