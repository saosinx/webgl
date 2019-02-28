import WebGLUtils, { addTexture, degToRad } from './webgl-google-utils'
import { mat4, vec3 } from './webgl-matrix'
import { createProgram, createShader, resizeCanvasToDisplaySize } from './webgl-utils'

let gl: any

const attribs: any = {}
const uniforms: any = {}

const viewMatrix = mat4.identity(mat4.create())
const modelMatrix = mat4.identity(mat4.create())
const modelViewMatrix = mat4.identity(mat4.create())
const perspectiveMatrix = mat4.identity(mat4.create())
const mvpMatrix = mat4.identity(mat4.create())
mat4.perspective(perspectiveMatrix, degToRad(60), 1, 1, 100)

const $ = function(selector: string, qs?: boolean): HTMLElement {
	if (!qs) {
		return document.getElementById(selector)
	}
	return document.querySelector(selector)
}

const controlPanel: HTMLElement = $('control-panel')
const fpsCounter: HTMLElement = $('fps-counter')
const frameCounter: HTMLElement = $('frame-counter')
const timeCounter: HTMLElement = $('time-counter')
const scale: HTMLElement = $('scale')
const rotX: HTMLElement = $('rotateX')
const rotY: HTMLElement = $('rotateY')
const rotZ: HTMLElement = $('rotateZ')
const trsX: HTMLElement = $('translateX')
const trsY: HTMLElement = $('translateY')
const trsZ: HTMLElement = $('translateZ')
const eyeX: HTMLElement = $('eyeX')
const eyeY: HTMLElement = $('eyeY')
const eyeZ: HTMLElement = $('eyeZ')

controlPanel.oninput = function(e: Event) {
	const input: any = e.target
	const value: any = parseFloat(input.value).toFixed(2)
	input.nextSibling.innerHTML = value
}

const initShaders = function(resolve: () => void, reject: (err: Error) => void) {
	const fShader: WebGLShader = new Promise((res, rej) =>
		createShader(gl, 'fragment-shader', res, rej),
	)
	const vShader: WebGLShader = new Promise((res, rej) =>
		createShader(gl, 'vertex-shader', res, rej),
	)

	Promise.all([fShader, vShader]).then((shaders) => {
		gl.program = createProgram(gl, shaders)
		gl.useProgram(gl.program)

		resolve()
	})
}

const initVariables = function() {
	attribs.aPosition = gl.getAttribLocation(gl.program, 'a_Position')
	attribs.aColor = gl.getAttribLocation(gl.program, 'a_Color')

	uniforms.uWidth = gl.getUniformLocation(gl.program, 'u_Width')
	uniforms.uHeight = gl.getUniformLocation(gl.program, 'u_Height')
	uniforms.uMvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix')
}

const initTextures = function() {
	return true
}
// prettier-ignore
const initBuffer = function(): number {
	const vertices = new Float32Array([
		1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
		-1.0, 1.0, 1.0, 1.0, 0.0, 1.0,
		-1.0, -1.0, 1.0, 1.0, 0.0, 0.0,
		1.0, -1.0, 1.0, 1.0, 1.0, 0.0,
		1.0, -1.0, -1.0, 0.0, 1.0, 0.0,
		1.0, 1.0, -1.0, 0.0, 1.0, 1.0,
		-1.0, 1.0, -1.0, 0.0, 0.0, 1.0,
		-1.0, -1.0, -1.0, 0.0, 0.0, 0.0,
	])

	const FSIZE = vertices.BYTES_PER_ELEMENT

	const vertexBuffer: WebGLBuffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

	gl.vertexAttribPointer(attribs.aPosition, 3, gl.FLOAT, false, FSIZE * 6, 0)
	gl.enableVertexAttribArray(attribs.aPosition)

	gl.vertexAttribPointer(attribs.aColor, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3)
	gl.enableVertexAttribArray(attribs.aColor)

	const indices = new Uint8Array([
		0, 1, 2, 0, 2, 3,
		0, 3, 4, 0, 4, 5,
		0, 5, 6, 0, 6, 1,
		1, 6, 7, 1, 7, 2,
		7, 4, 3, 7, 3, 2,
		4, 7, 6, 4, 6, 5,
	])

	const indexBuffer: WebGLBuffer = gl.createBuffer()
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

	return indices.length
}

const drawScene = function() {
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

	const eye = vec3.fromValues(
		parseFloat((eyeX as HTMLInputElement).value),
		parseFloat((eyeY as HTMLInputElement).value),
		parseFloat((eyeZ as HTMLInputElement).value),
	)
	const center = vec3.fromValues(0, 0, 0)
	const up = vec3.fromValues(0, 1, 0)

	mat4.lookAt(viewMatrix, eye, center, up)

	mat4.identity(modelMatrix)
	mat4.translate(
		modelMatrix,
		modelMatrix,
		vec3.fromValues(
			parseFloat((trsX as HTMLInputElement).value),
			parseFloat((trsY as HTMLInputElement).value),
			parseFloat((trsZ as HTMLInputElement).value),
		),
	)
	mat4.rotateX(modelMatrix, modelMatrix, degToRad((rotX as HTMLInputElement).value))
	mat4.rotateY(modelMatrix, modelMatrix, degToRad((rotY as HTMLInputElement).value))
	mat4.rotateZ(modelMatrix, modelMatrix, degToRad((rotZ as HTMLInputElement).value))
	mat4.scale(
		modelMatrix,
		modelMatrix,
		vec3.fromValues(
			parseFloat((scale as HTMLInputElement).value),
			parseFloat((scale as HTMLInputElement).value),
			parseFloat((scale as HTMLInputElement).value),
		),
	)
	mat4.mul(modelViewMatrix, viewMatrix, modelMatrix)
	mat4.mul(mvpMatrix, perspectiveMatrix, modelViewMatrix)

	gl.uniformMatrix4fv(uniforms.uMvpMatrix, false, mvpMatrix)

	gl.uniform1f(uniforms.uWidth, gl.drawingBufferWidth)
	gl.uniform1f(uniforms.uHeight, gl.drawingBufferHeight)

	gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0)
}

let lastTime: number = 0
let frames: number = 0
let fps: number | string
const render = function(time: DOMHighResTimeStamp = 0) {
	fps = (1000 / (time - lastTime)).toFixed(0)
	fpsCounter.textContent = fps
	frameCounter.textContent = ++frames + ''
	timeCounter.textContent = (time / 1000).toFixed(2)
	lastTime = time
	window.requestAnimationFrame(render)
	drawScene()
}

const webGLStart = function() {
	const canvas: any = document.getElementById('canvas')

	const powerPreference = 'default' || 'high-performance' || 'low-power'
	gl = WebGLUtils.setupWebGL(canvas, {
		alpha: true,
		depth: true,
		powerPreference,
	})

	gl.clearColor(0.0, 0.0, 0.0, 1.0)
	gl.enable(gl.DEPTH_TEST)

	resizeCanvasToDisplaySize(gl.canvas)

	console.log(gl)

	const promiseShader = new Promise((res, rej) => initShaders(res, rej))
	promiseShader
		.then(() => initVariables())
		.then(() => initTextures())
		.then(() => initBuffer())
		.then((n) => render())
		.catch((error: Error) => console.error(error))
}
// prettier-ignore
window.onload = function() {
	[].forEach.call(
		controlPanel.children,
		(child: HTMLElement) =>
			(child.children[2].innerHTML = parseFloat(child.children[1].getAttribute('value')).toFixed(
				2,
			)),
	)
	webGLStart()
}

window.addEventListener('resize', (e) => resizeCanvasToDisplaySize(gl.canvas))
