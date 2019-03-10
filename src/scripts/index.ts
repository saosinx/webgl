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

const viewMatrix = mat4.identity(mat4.create())
const modelMatrix = mat4.identity(mat4.create())
const modelViewMatrix = mat4.identity(mat4.create())
const perspectiveMatrix = mat4.identity(mat4.create())
const mvpMatrix: any = mat4.identity(mat4.create())
mat4.perspective(perspectiveMatrix, degToRad(60), 1, 1, 100)

const lightDirection: any = vec3.fromValues(0.5, 3.0, 4.0)
vec3.normalize(lightDirection, lightDirection)

const $ = function(selector: string, qs?: boolean): HTMLElement | SVGElement {
	if (!qs) return document.getElementById(selector)
	return document.querySelector(selector)
}

interface IScene {
	modelScale: {
		readonly elem: HTMLElement
		value: number
	}
	modelRotateX: {
		readonly elem: HTMLElement
		value: number
	}
	modelRotateY: {
		readonly elem: HTMLElement
		value: number
	}
	modelRotateZ: {
		readonly elem: HTMLElement
		value: number
	}
	modelTranslateX: {
		readonly elem: HTMLElement
		value: number
	}
	modelTranslateY: {
		readonly elem: HTMLElement
		value: number
	}
	modelTranslateZ: {
		readonly elem: HTMLElement
		value: number
	}
	cameraX: {
		readonly elem: HTMLElement
		value: number
	}
	cameraY: {
		readonly elem: HTMLElement
		value: number
	}
	cameraZ: {
		readonly elem: HTMLElement
		value: number
	}
	[key: string]: {
		readonly elem: HTMLElement
		value: number
	}
}

const scene: IScene = {
	modelScale: {
		elem: $('modelScale') as HTMLElement,
		value: 0,
	},
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
	attribs.aNormal = gl.getAttribLocation(gl.program, 'a_Normal')
	attribs.aColor = gl.getAttribLocation(gl.program, 'a_Color')

	uniforms.uMvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix')
	uniforms.uLightColor = gl.getUniformLocation(gl.program, 'u_LightColor')
	uniforms.uLightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection')
	uniforms.uHeight = gl.getUniformLocation(gl.program, 'u_Height')
	uniforms.uWidth = gl.getUniformLocation(gl.program, 'u_Width')
}

const initTextures = function() {
	return true
}

const initBuffer = function(): number {
	// prettier-ignore
	const vertices: Float32Array = new Float32Array([
		1.0, 1.0, 1.0,    -1.0, 1.0, 1.0,    -1.0, -1.0, 1.0,   1.0, -1.0, 1.0,
		1.0, 1.0, 1.0,     1.0, -1.0, 1.0,    1.0, -1.0, -1.0,  1.0, 1.0, -1.0,
		1.0, 1.0, 1.0,     1.0, 1.0, -1.0,   -1.0, 1.0, -1.0,  -1.0, 1.0, 1.0,
		-1.0, -1.0, 1.0,  -1.0, 1.0, 1.0,    -1.0, 1.0, -1.0,  -1.0, -1.0, -1.0,
		-1.0, -1.0, 1.0,  -1.0, -1.0, -1.0,   1.0, -1.0, -1.0,  1.0, -1.0, 1.0,
		1.0, -1.0, -1.0,  -1.0, -1.0, -1.0,  -1.0, 1.0, -1.0,   1.0, 1.0, -1.0,
	])

	const vertexBuffer: WebGLBuffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

	gl.vertexAttribPointer(attribs.aPosition, 3, gl.FLOAT, false, 0, 0)
	gl.enableVertexAttribArray(attribs.aPosition)

	// prettier-ignore
	const colors: Float32Array = new Float32Array([
		1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,
	])

	const colorsBuffer: WebGLBuffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer)
	gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW)

	gl.vertexAttribPointer(attribs.aColor, 3, gl.FLOAT, false, 0, 0)
	gl.enableVertexAttribArray(attribs.aColor)

	// prettier-ignore
	const normals: Float32Array = new Float32Array([
		0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0, 	 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0, 	 1.0, 0.0, 0.0,
		0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0, 	 0.0, 1.0, 0.0,
		-1.0, 0.0, 0.0, -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,
		0.0, -1.0, 0.0,  0.0, -1.0, 0.0,  0.0, -1.0, 0.0,  0.0, -1.0, 0.0,
		0.0, 0.0, -1.0,  0.0, 0.0, -1.0,  0.0, 0.0, -1.0,  0.0, 0.0, -1.0,
	])

	const normalsBuffer: WebGLBuffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer)
	gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW)

	gl.vertexAttribPointer(attribs.aNormal, 3, gl.FLOAT, false, 0, 0)
	gl.enableVertexAttribArray(attribs.aNormal)

	// prettier-ignore
	const indices: Uint8Array = new Uint8Array([
		0, 1, 2,    0, 2, 3,
		4, 5, 6,    4, 6, 7,
		8, 9, 10,   8, 10, 11,
		12, 13, 14, 12, 14, 15,
		16, 17, 18, 16, 18, 19,
		20, 21, 22, 20, 22, 23,
	])

	const indexBuffer: WebGLBuffer = gl.createBuffer()
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

	return indices.length
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
	mat4.scale(
		modelMatrix,
		modelMatrix,
		vec3.fromValues(scene.modelScale.value, scene.modelScale.value, scene.modelScale.value)
	)
	mat4.mul(modelViewMatrix, viewMatrix, modelMatrix)
	mat4.mul(mvpMatrix, perspectiveMatrix, modelViewMatrix)

	gl.uniformMatrix4fv(uniforms.uMvpMatrix, false, mvpMatrix)
	gl.uniform3f(uniforms.uLightColor, 1.0, 1.0, 1.0)
	gl.uniform3fv(uniforms.uLightDirection, lightDirection)

	gl.uniform1f(uniforms.uWidth, gl.drawingBufferWidth)
	gl.uniform1f(uniforms.uHeight, gl.drawingBufferHeight)

	gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0)
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
		.then((indices: number) => render())
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
