import WebGLCustomUtils from './scripts/webgl-custom-utils'
import WebGLUtils from './scripts/webgl-google-utils'
import { mat4, vec3 } from './scripts/webgl-matrix'
import { createProgram, createShader, resizeCanvasToDisplaySize } from './scripts/webgl-utils'
import { Shader } from './scripts/constants'
import { IWebGLRenderingContext } from './scripts/types'
import './index.scss'

let gl: IWebGLRenderingContext

const Utils = new WebGLCustomUtils()

const initShaders = () => {
	gl.program = createProgram(gl, [createShader(gl, Shader.Fragment), createShader(gl, Shader.Vertex)])
	gl.useProgram(gl.program)
}

const initVariables = () => {}

const initTextures = () => {}

const initBuffer = () => {}

const drawScene = () => {
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
	gl.drawArrays(gl.POINTS, 0, 1)
}

const render = (time: DOMHighResTimeStamp = 0) => {
	window.requestAnimationFrame(render)

	Utils.fps = 1e3 / (time - Utils.lastTime)
	Utils.fpsCounter.textContent = Utils.fps.toFixed(1)
	Utils.frameCounter.textContent = String(++Utils.frames)
	Utils.timeCounter.textContent = (time / 1e3).toFixed(2)
	Utils.lastTime = time

	drawScene()
}

const webGLStart = () => {
	const canvas = <HTMLCanvasElement>Utils.$('canvas')

	const powerPreference = 'default' || 'high-performance' || 'low-power'
	gl = <IWebGLRenderingContext>WebGLUtils.setupWebGL(canvas, {
		alpha: true,
		depth: true,
		powerPreference,
	})

	Utils.gl = gl

	gl.clearColor(0.0, 0.0, 0.0, 1.0)
	gl.enable(gl.DEPTH_TEST)

	resizeCanvasToDisplaySize(gl.canvas)

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

window.addEventListener('resize', () => resizeCanvasToDisplaySize(gl.canvas))
