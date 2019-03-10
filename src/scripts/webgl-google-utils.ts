/*
 * Copyright 2010, Google Inc.
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
 *     * Neither the name of Google Inc. nor the names of its
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
 *
 * Modified by Alex Garneau - Feb 2, 2012 - gskinner.com inc.
 */

/**
 * @fileoverview This file contains functions every webgl program will need
 * a version of one way or another.
 *
 * Instead of setting up a context manually it is recommended to
 * use. This will check for success or failure. On failure it
 * will attempt to present an approriate message to the user.
 *
 *       gl = WebGLUtils.setupWebGL(canvas);
 *
 * For animated WebGL apps use of setTimeout or setInterval are
 * discouraged. It is recommended you structure your rendering
 * loop like this.
 *
 *       function render() {
 *         window.requestAnimFrame(render, canvas);
 *
 *         // do rendering
 *         ...
 *       }
 *       render();
 *
 * This will call your rendering function up to the refresh rate
 * of your display but will stop rendering if your app is not
 * visible.
 */

export function getPositionFromMatrix(matrix: number[]): { x: number; y: number; z: number } {
	return { x: matrix[12], y: matrix[13], z: matrix[14] }
}

export function getRotationFromMatrix(matrix: number[]) {
	return { x: Math.asin(matrix[6]), y: Math.asin(matrix[8]), z: Math.asin(matrix[1]) }
}

export function degToRad(degrees: number | string): number {
	return (parseFloat(degrees as string) * Math.PI) / 180
}

export function getMousePosition(event: MouseEvent): { x: number; y: number } {
	return { x: event.offsetX, y: event.offsetY }
}

export function getNodeFromMouse(
	canvas: HTMLCanvasElement,
	mouse: MouseEvent,
	gridSize: number,
	GRID_WIDTH: number,
	GRID_HEIGHT: number
): { x: number; y: number } | null {
	// We're getting it in this format: left=0, right=gridSize. Same with top and bottom.
	// First, let's see what the grid looks like compared to the canvas.
	// Its borders will always be touching whichever part's thinner: the width or the height.

	const middleCanvas: { x: number; y: number } = { x: canvas.width / 2, y: canvas.height / 2 }

	const pos: { x: number; y: number } = {
		x: (gridSize * (mouse.x - (middleCanvas.x - GRID_WIDTH * 0.5))) / GRID_WIDTH,
		y: (gridSize * (mouse.y - (middleCanvas.y - GRID_HEIGHT * 0.5))) / GRID_HEIGHT,
	}

	if (pos.x >= 0 && pos.x <= gridSize && pos.y >= 0 && pos.y <= gridSize) {
		const item = { x: pos.x | 0, y: pos.y | 0 }
		return item
	} else {
		return null
	}
}
export function getCoordinateFromMouse(
	canvas: HTMLCanvasElement,
	mouse: MouseEvent,
	gridSize: number,
	GRID_WIDTH: number,
	GRID_HEIGHT: number
): { x: number; y: number } {
	// We're getting it in this format: left=0, right=gridSize. Same with top and bottom.
	// First, let's see what the grid looks like compared to the canvas.
	// Its borders will always be touching whichever part's thinner: the width or the height.

	const middleCanvas: { x: number; y: number } = { x: canvas.width, y: canvas.height }

	const pos: { x: number; y: number } = {
		x: (gridSize * (mouse.x - (middleCanvas.x - GRID_WIDTH * 0.5))) / GRID_WIDTH,
		y: (gridSize * (mouse.y - (middleCanvas.y - GRID_HEIGHT * 0.5))) / GRID_HEIGHT,
	}

	return pos
}

/*
 * When an image is loaded, this will store it in the shader to be used by the sampler references.
 * For example, to use the texture stored at TEXTURE0, you set the sampler to 0.
 */

export function addTexture(
	gl: WebGLRenderingContext,
	imageURL: string,
	glTexture: GLenum
): WebGLTexture {
	function isPowerOf2(value: number): boolean {
		if ((value & (value - 1)) === 0) {
			return true
		}
	}

	interface IWebGLTextureExtended extends WebGLTexture {
		image?: HTMLImageElement
	}

	const texture: IWebGLTextureExtended = gl.createTexture()
	texture.image = new Image()
	texture.image.onload = function(): void {
		gl.activeTexture(glTexture)
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
		gl.bindTexture(gl.TEXTURE_2D, texture)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image)

		// This clamps images whose dimensions are not a power of 2, letting you use images of any size.
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
	}

	texture.image.src = imageURL
	return texture
}

export function ease(from: number, to: number, easiness: number): number {
	if (easiness > 1) {
		easiness = 1 / easiness
	}
	return (to - from) * easiness
}

export function displayAlertMatrix(matrix: number[]): void {
	let testString: string = ''
	for (let i: number = 0, l: number = matrix.length; i < l; i++) {
		if (i % 4 === 0 && i > 0) {
			testString += '\n'
		}
		testString += matrix[i] + ', '
	}
	testString += ''
	alert(testString)
}

export function addVectors(vec1: number[], vec2: number[]): number[] {
	for (let i: number = 0, l: number = vec1.length; i < l; i++) {
		if (vec2[i]) {
			vec1[i] += vec2[i]
		}
	}
	return vec1
}
export function subtractVectors(vec1: number[], vec2: number[]): number[] {
	for (let i: number = 0, l: number = vec1.length; i < l; i++) {
		if (vec2[i]) {
			vec1[i] -= vec2[i]
		}
	}
	return vec1
}

export function inverseVector(vec: number[]): number[] {
	for (let i: number = 0, l: number = vec.length; i < l; i++) {
		vec[i] = 1 - Math.abs(vec[i])
	}
	return vec
}

export function alertMat4(mat: number[]): void {
	let string: string = '['

	for (let i: number = 0; i < 4; i++) {
		for (let j: number = 0; j < 4; j++) {
			string += Math.round(mat[i * 4 + j]).toString() + ', \t'
		}
		string += '\n'
	}
	string += ']'
	alert(string)
}

export function Float32Concat(original: number[], addition: number[]): Float32Array | number[] {
	if (!original) {
		return addition
	}

	const length: number = original.length
	const totalLength: number = length + addition.length

	const result = new Float32Array(totalLength)

	result.set(original)
	result.set(addition, length)

	return result
}

let totalTimePassed: number = 0
let lastTimePassed: number = 0
export function ConsoleTimePassed(message: string): void {
	totalTimePassed = new Date().getTime()
	console.log(message + ': ' + (totalTimePassed - lastTimePassed))
	lastTimePassed = totalTimePassed
}

export function easeNormalVec(vec: number[]): number[] {
	vec[0] += (1 - vec[0]) / 2
	vec[1] += (1 - vec[1]) / 2
	vec[2] += (1 - vec[2]) / 2

	return vec
}
export function getBetweenVec(min: number[], range: number[]): number[] {
	const vec: number[] = [0, 0, 0]
	vec[0] = Math.random() * range[0] + min[0]
	vec[1] = Math.random() * range[1] + min[1]
	vec[2] = Math.random() * range[2] + min[2]

	return vec
}

export function normalize(vec: number[]): number[] {
	let i: number = 0
	let total: number = 0
	const l: number = vec.length
	for (i = 0; i < l; i++) {
		total += vec[i]
	}
	for (i = 0; i < l; i++) {
		vec[i] /= total
	}
	return vec
}

const WebGLUtils = (function(): {
	setupWebGL: (
		canvas: HTMLCanvasElement,
		opt_attribs?: object,
		opt_onError?: any
	) => CanvasRenderingContext2D | WebGLRenderingContext | null
	create3DContext: (
		canvas: HTMLCanvasElement,
		opt_attribs?: object
	) => CanvasRenderingContext2D | WebGLRenderingContext | null
} {
	/**
	 * Creates the HTLM for a failure message
	 * @param {string} canvasContainerId id of container of th
	 *        canvas.
	 * @return {string} The html.
	 */
	const makeFailHTML = function(msg: string): string {
		return (
			'' +
			'<table style="background-color: #8CE; width: 100%; height: 100%;"><tr>' +
			'<td align="center">' +
			'<div style="display: table-cell; vertical-align: middle;">' +
			'<div style="">' +
			msg +
			'</div>' +
			'</div>' +
			'</td></tr></table>'
		)
	}

	/**
	 * Mesasge for getting a webgl browser
	 * @type {string}
	 */
	const GET_A_WEBGL_BROWSER: string =
		'' +
		'This page requires a browser that supports WebGL.<br/>' +
		'<a href="http://get.webgl.org">Click here to upgrade your browser.</a>'

	/**
	 * Mesasge for need better hardware
	 * @type {string}
	 */
	const OTHER_PROBLEM: string = `It doesn't appear your computer can support WebGL.<br/>
		<a href="http://get.webgl.org/troubleshooting/">Click here for more information.</a>`

	/**
	 * Creates a webgl context. If creation fails it will
	 * change the contents of the container of the <canvas>
	 * tag to an error message with the correct links for WebGL.
	 * @param {HTMLCanvasElement} canvas. The canvas element to create a
	 *     context from.
	 * @param {WebGLContextCreationAttirbutes} opt_attribs Any
	 *     creation attributes you want to pass in.
	 * @param {function:(msg)} opt_onError An function to call
	 *     if there is an error during creation.
	 * @return {WebGLRenderingContext} The created context.
	 */
	const setupWebGL = function(
		canvas: HTMLCanvasElement,
		opt_attribs?: object,
		opt_onError?: any
	): CanvasRenderingContext2D | WebGLRenderingContext | null {
		function handleCreationError(msg: string): void {
			const container: Node = canvas.parentNode
			if (container) {
				let str: string = (window as any).WebGLRenderingContext
					? OTHER_PROBLEM
					: GET_A_WEBGL_BROWSER
				if (msg) {
					str += '<br/><br/>Status: ' + msg
				}
				container.textContent = makeFailHTML(str)
			}
		}

		opt_onError = opt_onError || handleCreationError

		if (canvas.addEventListener) {
			canvas.addEventListener(
				'webglcontextcreationerror',
				(event: WebGLContextEvent): void => opt_onError(event.statusMessage)
			)
		}
		const context: CanvasRenderingContext2D | WebGLRenderingContext | null = create3DContext(
			canvas,
			opt_attribs
		)
		if (!context) {
			if (!(window as any).WebGLRenderingContext) {
				opt_onError('')
			}
		}
		return context
	}

	/**
	 * Creates a webgl context.
	 * @param {!Canvas} canvas The canvas tag to get context
	 *     from. If one is not passed in one will be created.
	 * @return {!WebGLContext} The created context.
	 */
	const create3DContext = function(
		canvas: HTMLCanvasElement,
		opt_attribs?: object
	): CanvasRenderingContext2D | WebGLRenderingContext | null {
		const names: string[] = ['webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl']
		let context: CanvasRenderingContext2D | WebGLRenderingContext | null = null
		for (const name of names) {
			try {
				context = canvas.getContext(name, opt_attribs)
			} catch (e) {
				console.error(e)
			}
			if (context) {
				break
			}
		}
		return context
	}

	return { setupWebGL, create3DContext }
})()

window.requestAnimationFrame = (function() {
	return (
		(window as any).requestAnimationFrame ||
		(window as any).webkitRequestAnimationFrame ||
		(window as any).mozRequestAnimationFrame ||
		(window as any).oRequestAnimationFrame ||
		(window as any).msRequestAnimationFrame ||
		function(callback: () => void): void {
			window.setTimeout(callback, 1000 / 15)
		}
	)
})()

export default WebGLUtils
