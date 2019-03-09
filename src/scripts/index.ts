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

	const promiseShader = new Promise((res, rej) => initShaders(res, rej))
	promiseShader
		.then(() => initVariables())
		.then(() => initTextures())
		.then(() => initBuffer())
		.then((indices) => render())
		.catch((error: Error) => console.error(error))
}

const updateInfobar = function(elem: HTMLElement) {
	elem.innerHTML = scene[elem.id].value.toFixed(2)
}

const setCanvasControls = function(): void {
	let isRotatable = false

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
		let direction = e.deltaY < 0 ? -0.15 : 0.15
		if (e.shiftKey) direction *= 3
		scene.cameraZ.value += direction
		updateInfobar(scene.cameraZ.elem)
	})
}

window.onload = function() {
	for (const key in scene) {
		if (scene.hasOwnProperty(key)) {
			scene[key].value = +parseFloat(scene[key].elem.innerHTML)
		}
	}

	webGLStart()
	setCanvasControls()
}

window.addEventListener('resize', (e: Event) => resizeCanvasToDisplaySize(gl.canvas))
