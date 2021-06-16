import { WCU } from './scripts/webgl-custom-utils'

const endAngle = Math.PI * 2
let ctx: CanvasRenderingContext2D

class Ball {
	public x: number
	public y: number
	public vx: number
	public vy: number

	protected radius: number
	protected color: CanvasFillStrokeStyles['fillStyle']

	constructor() {
		this.x = Math.random() * ctx.canvas.width
		this.y = Math.random() * ctx.canvas.height
		this.vx = Math.random()
		this.vy = Math.random()
		this.radius = 2
		this.color = 'white'
	}

	draw() {
		ctx.beginPath()
		ctx.arc(this.x, this.y, this.radius, 0, endAngle, true)
		ctx.closePath()
		ctx.fillStyle = this.color
		ctx.fill()
	}
}

const balls = []

const draw = (delta = 0) => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

	for (const ball of balls) {
		ball.draw()
		ball.x += ball.vx
		ball.y += ball.vy

		if (ball.y + ball.vy + ball.radius > ctx.canvas.height || ball.y + ball.vy - ball.radius < 0) {
			ball.vy = -ball.vy
		}

		if (ball.x + ball.vx + ball.radius > ctx.canvas.width || ball.x + ball.vx - ball.radius < 0) {
			ball.vx = -ball.vx
		}
	}
}

const render = (time: DOMHighResTimeStamp = 0) => {
	window.requestAnimationFrame(render)
	WCU.updateCanvasStats(time)
	draw(time)
}

export const start = () => {
	const canvas = <HTMLCanvasElement>document.getElementById('canvas')
	WCU.ctx = canvas.getContext('2d', { alpha: false, desynchronized: true })
	ctx = WCU.ctx

	setTimeout(() => {
		for (let i = 0; i < 300; i++) {
			balls.push(new Ball())
		}
	})

	render()
}
