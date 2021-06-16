import { WCU } from './scripts/webgl-custom-utils'
import WebGLUtils, { addTexture } from './scripts/webgl-google-utils'
import { mat4 } from './scripts/webgl-matrix'
import { createProgram, createShader } from './scripts/webgl-utils'
import { colors, Shader } from './scripts/constants'
import { IWebGLRenderingContext } from './scripts/types'

import stoneWallTexture from './images/tileable_stone_wall_texture.jpg'
import greenCircleTexture from './images/green-circle.jpg'
import brickwallTexture from './images/brickwall.jpg'
import sun from './images/sun.gif'

const textures = [stoneWallTexture, greenCircleTexture, brickwallTexture, sun]

const SCENE = {
	vertices: 0,
}

const vars: { [key: string]: any } = {}

const initVertexBuffer = (location: number, vertices: Float32Array, size = 3, stride = 0, offset = 0) => {
	const fSize = vertices.BYTES_PER_ELEMENT

	WCU.ctx.bindBuffer(WCU.ctx.ARRAY_BUFFER, WCU.ctx.createBuffer())
	WCU.ctx.bufferData(WCU.ctx.ARRAY_BUFFER, vertices, WCU.ctx.STATIC_DRAW)
	WCU.ctx.vertexAttribPointer(location, size, WCU.ctx.FLOAT, false, stride * fSize, offset * fSize)
	WCU.ctx.enableVertexAttribArray(location)
}

const initShaders = () => {
	WCU.ctx.program = createProgram(WCU.ctx, [
		createShader(WCU.ctx, Shader.Fragment),
		createShader(WCU.ctx, Shader.Vertex),
	])
	WCU.ctx.useProgram(WCU.ctx.program)
}

const initVariables = () => {
	vars.aPosition = WCU.ctx.getAttribLocation(WCU.ctx.program, 'a_Position')
	vars.aTexCoord = WCU.ctx.getAttribLocation(WCU.ctx.program, 'a_TexCoord')
	vars.aColor = WCU.ctx.getAttribLocation(WCU.ctx.program, 'a_Color')
	vars.uTransform = WCU.ctx.getUniformLocation(WCU.ctx.program, 'u_Transform')
	vars.uSampler = WCU.ctx.getUniformLocation(WCU.ctx.program, 'u_Sampler')
}

const initTextures = () => {
	const ctx = WCU.ctx
	addTexture(ctx, textures[0], ctx.TEXTURE0)
	ctx.uniform1i(vars.uSampler, 0)
}

const initBuffer = () => {
	// prettier-ignore
	const vertices = new Float32Array([
		-0.8, 0.8, 0.0,   0.0, 1.0,  ...colors.monk.rgb,
		-0.8, -0.8, 0.0,  0.0, 0.0,  ...colors.druid.rgb,
		0.8, -0.8, 0.0,   1.0, 0.0,  ...colors.deathknight.rgb,
		0.8, 0.8, 0.0,    1.0, 1.0,  ...colors.warlock.rgb,
	])

	SCENE.vertices = 4

	initVertexBuffer(vars.aPosition, vertices, 3, 8)
	initVertexBuffer(vars.aTexCoord, vertices, 2, 8, 3)
	initVertexBuffer(vars.aColor, vertices, 3, 8, 5)
}

const drawScene = (delta = 0, ctx: IWebGLRenderingContext) => {
	ctx.viewport(0, 0, ctx.drawingBufferWidth, ctx.drawingBufferHeight)
	ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT)

	ctx.uniformMatrix4fv(
		vars.uTransform,
		false,
		mat4.multiply(
			mat4.create(),
			mat4.fromScaling(mat4.create(), [WCU._.viewportRatio, 1, 1]),
			mat4.fromRotation(mat4.create(), WCU.rad(delta * 0), [0, 0, 1])
		)
	)

	ctx.drawArrays(ctx.TRIANGLE_FAN, 0, SCENE.vertices)
}

const render = (time: DOMHighResTimeStamp = 0) => {
	window.requestAnimationFrame(render)

	WCU.updateCanvasStats(time)

	drawScene(time, WCU.ctx)
}

export const webGLStart = () => {
	const canvas = <HTMLCanvasElement>document.getElementById('canvas')

	WCU.ctx = <IWebGLRenderingContext>WebGLUtils.setupWebGL(canvas, {
		alpha: true,
		depth: true,
		powerPreference: 'default' || 'high-performance' || 'low-power',
	})

	WCU.ctx.clearColor(0.0, 0.0, 0.0, 1.0)
	WCU.ctx.enable(WCU.ctx.DEPTH_TEST)

	initShaders()
	initVariables()
	initTextures()
	initBuffer()
	render()
}
