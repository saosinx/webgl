import bezier from './bezier-easing'
import WebGLUtils, { addTexture, degToRad } from './webgl-google-utils'
import { mat4, vec3 } from './webgl-matrix'
import { createProgram, createShader, resizeCanvasToDisplaySize } from './webgl-utils'

interface IWebGLRenderingContextExtended extends WebGLRenderingContext {
	program: WebGLProgram
}

let gl: IWebGLRenderingContextExtended

const attribs: any = {}
const uniforms: any = {}

let arraysToDraw: number = 0

const viewMatrix: any = mat4.identity(mat4.create())
const modelMatrix: any = mat4.identity(mat4.create())
const modelViewMatrix: any = mat4.identity(mat4.create())
const perspectiveMatrix: any = mat4.identity(mat4.create())
const mvpMatrix: any = mat4.identity(mat4.create())
mat4.perspective(perspectiveMatrix, degToRad(60), 1, 0.1, 100)

const generateCircleVertices = function(radius: number, accuracy: number): number[] {
	const angle = (360 / accuracy) * (Math.PI / 180)
	const vertices = []

	for (let i = 0; i < accuracy; i += 1) {
		const x = radius * Math.cos(angle * i)
		const y = radius * Math.sin(angle * i)

		vertices.push(x, y)
	}

	return vertices
}

const generateSphereVertices = function(radius: number, accuracy: number): number[] {
	const n = accuracy
	const vertices = []

	function getCoords(alpha: number, phi: number): number[] {
		const coords: number[] = []

		const x = radius * Math.cos(phi) * Math.sin(alpha)
		const y = radius * Math.cos(alpha)
		const z = -1 * +(Math.sin(phi) * Math.sin(alpha))
		coords.push(x, y, z)

		return coords
	}

	function getTriangle(
		alpha1: number,
		alpha2: number,
		phi1: number,
		phi2: number,
		left: boolean = false
	): number[] {
		const triangle: number[] = []
		let a: number[]
		let b: number[]
		let c: number[]

		if (left) {
			a = getCoords(alpha1, phi2)
			b = getCoords(alpha2, phi1)
			c = getCoords(alpha1, phi1)
		} else {
			a = getCoords(alpha1, phi2)
			b = getCoords(alpha2, phi2)
			c = getCoords(alpha2, phi1)
		}

		triangle.push(...a, ...b, ...c)

		return triangle
	}

	for (let j = 0; j < n; j += 1) {
		const phi1 = (2 * Math.PI * j) / n
		const phi2 = (2 * Math.PI * (j + 1)) / n

		for (let i = 0; i < n; i += 1) {
			const alpha1 = (Math.PI * i) / n
			const alpha2 = (Math.PI * (i + 1)) / n

			if (i === 0) {
				vertices.push(...getTriangle(alpha1, alpha2, phi1, phi2))
				continue
			} else if (i === n - 1) {
				vertices.push(...getTriangle(alpha1, alpha2, phi1, phi2, true))
				continue
			}

			vertices.push(...getTriangle(alpha1, alpha2, phi1, phi2, true))
			vertices.push(...getTriangle(alpha1, alpha2, phi1, phi2))
		}
	}

	return vertices
}

const $ = function(selector: string, qs?: boolean): HTMLElement | SVGElement {
	if (!qs) return document.getElementById(selector)
	return document.querySelector(selector)
}

interface IScene {
	[key: string]: {
		readonly elem: HTMLElement
		value: number
	}
}

const scene: IScene = {
	modelRotateX: {
		elem: $('modelRotateX') as HTMLElement,
		value: 0,
	},
	modelRotateY: {
		elem: $('modelRotateY') as HTMLElement,
		value: 0,
	},
	modelRotateZ: {
		elem: $('modelRotateZ') as HTMLElement,
		value: 0,
	},
	modelTranslateX: {
		elem: $('modelTranslateX') as HTMLElement,
		value: 0,
	},
	modelTranslateY: {
		elem: $('modelTranslateY') as HTMLElement,
		value: 0,
	},
	modelTranslateZ: {
		elem: $('modelTranslateZ') as HTMLElement,
		value: 0,
	},
	cameraX: {
		elem: $('cameraX') as HTMLElement,
		value: 0,
	},
	cameraY: {
		elem: $('cameraY') as HTMLElement,
		value: 0,
	},
	cameraZ: {
		elem: $('cameraZ') as HTMLElement,
		value: 0,
	},
}

const fpsCounter = $('fps-counter')
const frameCounter = $('frame-counter')
const timeCounter = $('time-counter')

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

	uniforms.uMvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix')
	uniforms.uModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix')
	uniforms.uHeight = gl.getUniformLocation(gl.program, 'u_Height')
	uniforms.uWidth = gl.getUniformLocation(gl.program, 'u_Width')
}

const initTextures = function() {
	return true
}

const initBuffer = function(): void {
	const vertices: Float32Array = new Float32Array([...generateSphereVertices(1, 100)])

	const vertexBuffer: WebGLBuffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

	gl.vertexAttribPointer(attribs.aPosition, 3, gl.FLOAT, false, 0, 0)
	gl.enableVertexAttribArray(attribs.aPosition)

	arraysToDraw = vertices.length / 3
}

const drawScene = function(): void {
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

	const camera = vec3.fromValues(scene.cameraX.value, scene.cameraY.value, scene.cameraZ.value)
	const center = vec3.fromValues(0, 0, 0)
	const up = vec3.fromValues(0, 1, 0)

	mat4.lookAt(viewMatrix, camera, center, up)

	mat4.identity(modelMatrix)
	mat4.translate(
		modelMatrix,
		modelMatrix,
		vec3.fromValues(
			scene.modelTranslateX.value,
			scene.modelTranslateY.value,
			scene.modelTranslateZ.value
		)
	)
	mat4.rotateX(modelMatrix, modelMatrix, degToRad(scene.modelRotateX.value))
	mat4.rotateY(modelMatrix, modelMatrix, degToRad(scene.modelRotateY.value))
	mat4.rotateZ(modelMatrix, modelMatrix, degToRad(scene.modelRotateZ.value))

	mat4.mul(modelViewMatrix, viewMatrix, modelMatrix)
	mat4.mul(mvpMatrix, perspectiveMatrix, modelViewMatrix)

	gl.uniformMatrix4fv(uniforms.uMvpMatrix, false, mvpMatrix)
	gl.uniformMatrix4fv(uniforms.uModelMatrix, false, modelMatrix)

	gl.uniform1f(uniforms.uWidth, gl.drawingBufferWidth)
	gl.uniform1f(uniforms.uHeight, gl.drawingBufferHeight)

	gl.drawArrays(gl.TRIANGLES, 0, arraysToDraw)
}

let lastTime: number = 0
let frames: number = 0
let fps: number
const render = function(time: DOMHighResTimeStamp = 0) {
	fps = 1000 / (time - lastTime)
	fpsCounter.textContent = fps.toFixed(0)
	frameCounter.textContent = ++frames + ''
	timeCounter.textContent = (time / 1000).toFixed(2)
	lastTime = time
	window.requestAnimationFrame(render)
	drawScene()
}

const webGLStart = function(): void {
	const canvas: HTMLCanvasElement = $('canvas') as HTMLCanvasElement

	const powerPreference: string = 'default' || 'high-performance' || 'low-power'
	gl = WebGLUtils.setupWebGL(canvas, {
		alpha: true,
		depth: true,
		powerPreference,
	}) as IWebGLRenderingContextExtended

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

const updateInfobar = function(elem: HTMLElement): void {
	elem.innerHTML = scene[elem.id].value.toFixed(2)
}

const setCanvasControls = function(): void {
	let isRotatable: boolean = false

	gl.canvas.addEventListener('mousedown', (e: MouseEvent) => (isRotatable = true))
	gl.canvas.addEventListener('mouseup', (e: MouseEvent) => (isRotatable = false))
	gl.canvas.addEventListener('mousemove', (e: MouseEvent) => {
		if (!isRotatable) return false

		if (e.shiftKey) {
			scene.modelTranslateX.value += 10 * (e.movementX / gl.drawingBufferWidth)
			scene.modelTranslateY.value -= 10 * (e.movementY / gl.drawingBufferWidth)

			updateInfobar(scene.modelTranslateX.elem)
			updateInfobar(scene.modelTranslateY.elem)

			return
		}

		scene.modelRotateX.value += e.movementY / 3
		scene.modelRotateY.value += e.movementX / 3

		updateInfobar(scene.modelRotateX.elem)
		updateInfobar(scene.modelRotateY.elem)
	})

	gl.canvas.addEventListener('wheel', (e: WheelEvent) => {
		let direction: number = e.deltaY < 0 ? -0.15 : 0.15
		if (e.shiftKey) direction *= 3
		scene.cameraZ.value += direction
		updateInfobar(scene.cameraZ.elem)
	})
}

window.onload = function(): void {
	for (const key in scene) {
		if (scene.hasOwnProperty(key)) {
			scene[key].value = +parseFloat(scene[key].elem.innerHTML)
		}
	}

	webGLStart()
	setCanvasControls()
}

window.addEventListener('resize', (e: Event) => resizeCanvasToDisplaySize(gl.canvas))
