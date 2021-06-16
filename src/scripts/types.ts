export interface IWebGLRenderingContext extends WebGLRenderingContext {
	program: WebGLProgram
	canvas: HTMLCanvasElement
}

export interface IWCU {
	ctx: IWebGLRenderingContext | CanvasRenderingContext2D

	deg: (rad: number) => number
	rad: (deg: number) => number
	sin: (angle: number) => number
	tan: (angle: number) => number
	cos: (angle: number) => number
	asin: (num: number) => number
	acos: (num: number) => number
	atan: (num: number) => number

	setCanvasStats: () => void
	updateCanvasStats: (time: number) => void
	_: {
		$: (selector: string, qs?: boolean) => Element
		viewportRatio: number
		lastTime: number
		frames: number
		fps: number
		stats: {
			fps: HTMLDivElement
			frame: HTMLDivElement
			time: HTMLDivElement
		}
		glob: {
			win: typeof window
			doc: typeof document
		}
	}
}
