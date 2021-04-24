export interface IWebGLRenderingContext extends WebGLRenderingContext {
	program: WebGLProgram
	canvas: HTMLCanvasElement
}

export interface IScene {
	[key: string]: {
		readonly elem: Element
		value: number
	}
}
