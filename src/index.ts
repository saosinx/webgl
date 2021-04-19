import { Prism, Sphere, Torus } from './scripts/models'
import WebGLCustomUtils from './scripts/webgl-custom-utils'
import WebGLUtils, { addTexture, rad } from './scripts/webgl-google-utils'
import { mat4, vec3 } from './scripts/webgl-matrix'
import { createProgram, createShader, resizeCanvasToDisplaySize } from './scripts/webgl-utils'
import { Shader } from './scripts/constants'
import './index.scss'

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

let arraysToDraw = 0

const viewMatrix = mat4.identity(mat4.create())
const modelMatrix = mat4.identity(mat4.create())
const modelViewMatrix = mat4.identity(mat4.create())
const perspectiveMatrix = mat4.identity(mat4.create())
const mvpMatrix = mat4.identity(mat4.create())
const normalMatrix = mat4.identity(mat4.create())

mat4.perspective(perspectiveMatrix, rad(60), 1, 0.1, 100)

const initShaders = () => {
	gl.program = createProgram(gl, [createShader(gl, Shader.Fragment), createShader(gl, Shader.Vertex)])
	gl.useProgram(gl.program)
}

const initVariables = () => {
	attribs.aPosition = gl.getAttribLocation(gl.program, 'a_Position')
	attribs.aColor = gl.getAttribLocation(gl.program, 'a_Color')

	uniforms.uMvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix')
	uniforms.uModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix')
	uniforms.uNormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix')
	uniforms.uLightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition')
	uniforms.uHeight = gl.getUniformLocation(gl.program, 'u_Height')
	uniforms.uWidth = gl.getUniformLocation(gl.program, 'u_Width')
}

const initTextures = () => true

const initBuffer = () => {
	models.elements.push(new Torus(160, 0.8, 0.4, 0, 0, 0))

	for (let i = 0; i < models.elements.length; i += 1) {
		models.all.push(...models.elements[i].vertices)
	}

	const vertices = new Float32Array([...models.all])
	const vertexBuffer = gl.createBuffer()

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

	gl.vertexAttribPointer(attribs.aPosition, 3, gl.FLOAT, false, 0, 0)
	gl.enableVertexAttribArray(attribs.aPositionas)

	arraysToDraw = vertices.length / 3
}

let frame = 0
const drawScene = () => {
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

	const camera = vec3.fromValues(Utils.scene.cameraX.value, Utils.scene.cameraY.value, Utils.scene.cameraZ.value)
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
	mat4.rotateX(modelMatrix, modelMatrix, 0)
	mat4.rotateY(modelMatrix, modelMatrix, rad(frame % 360))
	mat4.rotateZ(modelMatrix, modelMatrix, rad(frame % 360))

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

	frame += 1

	gl.uniform1f(uniforms.uWidth, gl.drawingBufferWidth)
	gl.uniform1f(uniforms.uHeight, gl.drawingBufferHeight)

	gl.drawArrays(gl.POINTS, 0, arraysToDraw)
}

const render = (time: DOMHighResTimeStamp = 0) => {
	window.requestAnimationFrame(render)

	Utils.fps = 1e3 / (time - Utils.lastTime)
	Utils.fpsCounter.textContent = Utils.fps.toFixed(1)
	Utils.frameCounter.textContent = ++Utils.frames + ''
	Utils.timeCounter.textContent = (time / 1e3).toFixed(2)
	Utils.lastTime = time
	drawScene()
}

const webGLStart = () => {
	const canvas = <HTMLCanvasElement>Utils.$('canvas')

	const powerPreference = 'default' || 'high-performance' || 'low-power'
	gl = <IWebGLRenderingContextExtended>WebGLUtils.setupWebGL(canvas, {
		alpha: true,
		depth: true,
		powerPreference,
	})

	Utils.gl = gl

	gl.clearColor(0.0, 0.0, 0.0, 1.0)
	gl.enable(gl.DEPTH_TEST)

	resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement)

	initShaders()
	initVariables()
	initTextures()
	initBuffer()
	render()
}

window.onload = () => {
	for (const key in Utils.scene) {
		if (Utils.scene.hasOwnProperty(key)) {
			Utils.scene[key].value = +parseFloat(Utils.scene[key].elem.innerHTML)
		}
	}

	webGLStart()
	Utils.setCanvasControls()
}

window.addEventListener('resize', (e: Event) => resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement))
