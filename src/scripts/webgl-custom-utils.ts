interface IWebGLRenderingContextExtended extends WebGLRenderingContext {
	program: WebGLProgram
}

interface IScene {
	[key: string]: {
		readonly elem: HTMLElement
		value: number
	}
}

export default class WebGLCustomUtils {
	public gl: IWebGLRenderingContextExtended
	public scene: IScene
	public fpsCounter: HTMLElement
	public frameCounter: HTMLElement
	public timeCounter: HTMLElement
	public lastTime: number
	public frames: number
	public fps: number

	constructor(gl?: IWebGLRenderingContextExtended) {
		this.scene = {
			modelRotateX: {
				elem: this.$('modelRotateX') as HTMLElement,
				value: 0,
			},
			modelRotateY: {
				elem: this.$('modelRotateY') as HTMLElement,
				value: 0,
			},
			modelRotateZ: {
				elem: this.$('modelRotateZ') as HTMLElement,
				value: 0,
			},
			modelTranslateX: {
				elem: this.$('modelTranslateX') as HTMLElement,
				value: 0,
			},
			modelTranslateY: {
				elem: this.$('modelTranslateY') as HTMLElement,
				value: 0,
			},
			modelTranslateZ: {
				elem: this.$('modelTranslateZ') as HTMLElement,
				value: 0,
			},
			cameraX: {
				elem: this.$('cameraX') as HTMLElement,
				value: 0,
			},
			cameraY: {
				elem: this.$('cameraY') as HTMLElement,
				value: 0,
			},
			cameraZ: {
				elem: this.$('cameraZ') as HTMLElement,
				value: 0,
			},
		}

		this.gl = gl

		this.fpsCounter = this.$('fps-counter') as HTMLElement
		this.frameCounter = this.$('frame-counter') as HTMLElement
		this.timeCounter = this.$('time-counter') as HTMLElement

		this.lastTime = 0
		this.frames = 0
		this.fps = 0
	}

	public $(selector: string, qs?: boolean): HTMLElement | SVGElement {
		if (!qs) return document.getElementById(selector)
		return document.querySelector(selector)
	}

	public setCanvasControls(): void {
		let isRotatable: boolean = false

		this.gl.canvas.addEventListener('mousedown', (e: MouseEvent) => (isRotatable = true))
		this.gl.canvas.addEventListener('mouseup', (e: MouseEvent) => (isRotatable = false))
		this.gl.canvas.addEventListener('mousemove', (e: MouseEvent) => {
			if (!isRotatable) return false

			if (e.shiftKey) {
				this.scene.modelTranslateX.value += 10 * (e.movementX / this.gl.drawingBufferWidth)
				this.scene.modelTranslateY.value -= 10 * (e.movementY / this.gl.drawingBufferWidth)

				this.updateInfobar(this.scene.modelTranslateX.elem)
				this.updateInfobar(this.scene.modelTranslateY.elem)

				return
			}

			this.scene.modelRotateX.value += e.movementY / 3
			this.scene.modelRotateY.value += e.movementX / 3

			this.updateInfobar(this.scene.modelRotateX.elem)
			this.updateInfobar(this.scene.modelRotateY.elem)
		})

		this.gl.canvas.addEventListener('wheel', (e: WheelEvent) => {
			let direction: number = e.deltaY < 0 ? -0.05 : 0.05
			if (e.shiftKey) direction *= 5
			this.scene.cameraZ.value += direction
			this.updateInfobar(this.scene.cameraZ.elem)
		})
	}

	protected updateInfobar(elem: HTMLElement): void {
		elem.innerHTML = this.scene[elem.id].value.toFixed(2)
	}
}
