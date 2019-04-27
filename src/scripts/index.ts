import bezier from './bezier-easing'
import { Prism, Sphere, Torus } from './models'
import WebGLCustomUtils from './webgl-custom-utils'
import WebGLUtils, { addTexture, degToRad } from './webgl-google-utils'
import { mat4, vec3 } from './webgl-matrix'
import { createProgram, createShader, resizeCanvasToDisplaySize } from './webgl-utils'

interface IWebGLRenderingContextExtended extends WebGLRenderingContext {
	program: WebGLProgram
}

let gl: IWebGLRenderingContextExtended

const Utils = new WebGLCustomUtils()

const attribs: {
	[key: string]: number
} = {}
const uniforms: {
	[key: string]: WebGLUniformLocation
} = {}

const models: any = {
	elements: [],
	all: [],
}

let arraysToDraw: number = 0

const viewMatrix: any = mat4.identity(mat4.create())
const modelMatrix: any = mat4.identity(mat4.create())
const modelViewMatrix: any = mat4.identity(mat4.create())
const perspectiveMatrix: any = mat4.identity(mat4.create())
const mvpMatrix: any = mat4.identity(mat4.create())
const normalMatrix: any = mat4.identity(mat4.create())

mat4.perspective(perspectiveMatrix, degToRad(60), 1, 0.1, 100)

const initShaders = function(resolve: () => void, reject: (err: Error) => void) {
	const fShader: WebGLShader = new Promise((res, rej) =>
		createShader(gl, 'fragment-shader', res, rej)
	)
	const vShader: WebGLShader = new Promise((res, rej) =>
		createShader(gl, 'vertex-shader', res, rej)
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

	uniforms.uMvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix')
	uniforms.uModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix')
	uniforms.uNormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix')
	uniforms.uLightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition')
	uniforms.uHeight = gl.getUniformLocation(gl.program, 'u_Height')
	uniforms.uWidth = gl.getUniformLocation(gl.program, 'u_Width')
}

const initTextures = function() {
	return true
}

const initBuffer = function(): void {
	// const sphere = new Sphere(0.5, 36)
	// const prism = new Prism(4, 1.5, 0.75)
	// const torus = new Torus(72, 0.65, 0.65)
	models.elements.push(new Sphere(0.7, 36), new Prism(5, 1.85, 0.5), new Torus(72, 1.05, 0.25))

	for (let i = 0; i < models.elements.length; i += 1) {
		models.all.push(...models.elements[i].vertices)
	}

	const vertices: Float32Array = new Float32Array([...models.all])
	// const vertices: Float32Array = new Float32Array([...prism.vertices])
	// const vertices: Float32Array = new Float32Array([...torus.vertices])
	const vertexBuffer: WebGLBuffer = gl.createBuffer()

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

	gl.vertexAttribPointer(attribs.aPosition, 3, gl.FLOAT, false, 0, 0)
	gl.enableVertexAttribArray(attribs.aPositionas)

	// const colors: Float32Array = new Float32Array([...prism.colors])
	// const colorBuffer: WebGLBuffer = gl.createBuffer()

	// gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
	// gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW)

	// gl.vertexAttribPointer(attribs.aColor, 3, gl.FLOAT, false, 0, 0)
	// gl.enableVertexAttribArray(attribs.aColor)

	arraysToDraw = vertices.length / 3
}

let frame: number = 0
const drawScene = function(): void {
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

	const camera = vec3.fromValues(
		Utils.scene.cameraX.value,
		Utils.scene.cameraY.value,
		Utils.scene.cameraZ.value
	)
	const center = vec3.fromValues(0, 0, 0)
	const up = vec3.fromValues(0, 1, 0)

	mat4.lookAt(viewMatrix, camera, center, up)

	mat4.identity(modelMatrix)
	mat4.translate(
		modelMatrix,
		modelMatrix,
		vec3.fromValues(
			Utils.scene.modelTranslateX.value,
			Utils.scene.modelTranslateY.value,
			Utils.scene.modelTranslateZ.value
		)
	)
	mat4.rotateX(modelMatrix, modelMatrix, degToRad(Utils.scene.modelRotateX.value))
	mat4.rotateY(modelMatrix, modelMatrix, degToRad(Utils.scene.modelRotateY.value))
	mat4.rotateZ(modelMatrix, modelMatrix, degToRad(Utils.scene.modelRotateZ.value))

	mat4.mul(modelViewMatrix, viewMatrix, modelMatrix)
	mat4.mul(mvpMatrix, perspectiveMatrix, modelViewMatrix)

	mat4.invert(normalMatrix, modelMatrix)
	mat4.transpose(normalMatrix, normalMatrix)

	gl.uniformMatrix4fv(uniforms.uMvpMatrix, false, mvpMatrix)
	gl.uniformMatrix4fv(uniforms.uModelMatrix, false, modelMatrix)
	gl.uniformMatrix4fv(uniforms.uNormalMatrix, false, normalMatrix)

	gl.uniform3fv(uniforms.uLightPosition, [
		3.0 * -Math.cos((2 * frame * Math.PI) / 360),
		3.0 * Math.cos((2 * frame * Math.PI) / 360),
		3.0 * Math.sin((2 * frame * Math.PI) / 360),
	])
	frame += 2
	gl.uniform1f(uniforms.uWidth, gl.drawingBufferWidth)
	gl.uniform1f(uniforms.uHeight, gl.drawingBufferHeight)

	gl.drawArrays(gl.TRIANGLES, 0, arraysToDraw)
}

const render = function(time: DOMHighResTimeStamp = 0) {
	Utils.fps = 1000 / (time - Utils.lastTime)
	Utils.fpsCounter.textContent = Utils.fps.toFixed(0)
	Utils.frameCounter.textContent = ++Utils.frames + ''
	Utils.timeCounter.textContent = (time / 1000).toFixed(2)
	Utils.lastTime = time
	window.requestAnimationFrame(render)
	drawScene()
}

const webGLStart = function(): void {
	const canvas: HTMLCanvasElement = <HTMLCanvasElement>Utils.$('canvas')

	const powerPreference: string = 'default' || 'high-performance' || 'low-power'
	gl = <IWebGLRenderingContextExtended>WebGLUtils.setupWebGL(canvas, {
		alpha: true,
		depth: true,
		powerPreference,
	})

	Utils.gl = gl

	gl.clearColor(0.0, 0.0, 0.0, 1.0)
	gl.enable(gl.DEPTH_TEST)

	resizeCanvasToDisplaySize(gl.canvas)

	const promiseShader: Promise<{}> = new Promise((res, rej) => initShaders(res, rej))
	promiseShader
		.then(() => initVariables())
		.then(() => initTextures())
		.then(() => initBuffer())
		.then(() => render())
		.catch((error: Error) => console.error(error))
}

// TODO Smooth animation
// const animate = function(duration: number, from: number, to: number): void {
// 	const easing = bezier(0.215, 0.61, 0.355, 1.0)
// 	const iterations: number = 60 / (duration / 1000)
// 	const step: number = 1 / iterations

// 	for (let i: number = 0; i <= iterations; i += 1) {
// 		(to - from) * easing(step * i) + from
// 	}
// }

window.onload = function(): void {
	for (const key in Utils.scene) {
		if (Utils.scene.hasOwnProperty(key)) {
			Utils.scene[key].value = +parseFloat(Utils.scene[key].elem.innerHTML)
		}
	}

	webGLStart()
	Utils.setCanvasControls()
}

window.addEventListener('resize', (e: Event) => resizeCanvasToDisplaySize(gl.canvas))
