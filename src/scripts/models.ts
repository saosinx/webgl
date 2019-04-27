import { mat4 } from './webgl-matrix'

export function generateCircle(radius: number, accuracy: number): number[] {
	const angle = (2 * Math.PI) / accuracy
	const vertices = []

	for (let i = 0; i < accuracy; i += 1) {
		const x = radius * Math.cos(angle * i)
		const y = radius * Math.sin(angle * i)

		vertices.push(x, y)
	}

	return vertices
}

export class Sphere {
	public vertices: number[]
	public colors: number[]
	public matrix: any

	private radius: number
	private n: number

	constructor(radius: number, n: number) {
		this.radius = radius
		this.n = n

		this.vertices = []
		this.colors = [0, 0, 0]
		this.matrix = mat4.create()
		this.generateSphere()
	}

	private generateTriangle(point: any, left: boolean = true): void {
		let alpha = 0
		let theta = 0

		for (let i = 0; i < 3; i += 1) {
			if (!i) {
				alpha = point.alpha
				theta = point.theta
			} else if (i === 1) {
				alpha = point.alpha2
				theta = point.theta2
			} else {
				alpha = left ? point.alpha : point.alpha2
				theta = left ? point.theta2 : point.theta
			}

			const x = this.radius * Math.cos(theta) * Math.sin(alpha)
			const y = this.radius * Math.cos(alpha)
			const z = -1 * this.radius * +(Math.sin(theta) * Math.sin(alpha))

			this.vertices.push(x, y, z)
		}
	}

	private generateSphere(): void {
		const point: any = {}

		for (let j = 0; j < this.n; j += 1) {
			point.theta = (2 * Math.PI * j) / this.n
			point.theta2 = (2 * Math.PI * (j + 1)) / this.n

			for (let i = 0; i < this.n; i += 1) {
				point.alpha = (Math.PI * i) / this.n
				point.alpha2 = (Math.PI * (i + 1)) / this.n

				if (!i) {
					this.generateTriangle(point, false)
					continue
				} else if (i === this.n - 1) {
					this.generateTriangle(point)
					continue
				}

				this.generateTriangle(point)
				this.generateTriangle(point, false)
			}
		}
	}
}

export class Torus {
	public colors: number[]
	public vertices: number[]
	public matrix: any

	private n: number
	private innerRadius: number
	private outerRadius: number
	private angleStep: number

	constructor(n: number, innerRadius: number, outerRadius: number) {
		this.n = n
		this.innerRadius = innerRadius
		this.outerRadius = outerRadius
		this.angleStep = (2 * Math.PI) / this.n

		this.colors = [0, 0, 0]
		this.vertices = []
		this.matrix = mat4.create()
		this.generateTorus()
	}

	private generateTriangle(point: any, left: boolean = true): void {
		let alpha = 0
		let theta = 0

		for (let i = 0; i < 3; i += 1) {
			if (!i) {
				alpha = point.alpha
				theta = point.theta
			} else if (i === 1) {
				alpha = point.alpha2
				theta = point.theta2
			} else {
				alpha = left ? point.alpha : point.alpha2
				theta = left ? point.theta2 : point.theta
			}

			const x =
				this.innerRadius * Math.cos(alpha) + this.outerRadius * Math.sin(theta) * Math.cos(alpha)
			const y = this.outerRadius * Math.cos(theta)
			const z =
				this.innerRadius * Math.sin(alpha) + this.outerRadius * Math.sin(theta) * Math.sin(alpha)

			this.vertices.push(x, y, z)
		}
	}

	private generateTorus(): void {
		const point: any = {}

		for (let i = 0; i < this.n; i += 1) {
			point.alpha = this.angleStep * i
			point.alpha2 = this.angleStep * (i + 1)

			for (let j = 0; j < this.n; j += 1) {
				point.theta = this.angleStep * j
				point.theta2 = this.angleStep * (j + 1)

				this.generateTriangle(point)
				this.generateTriangle(point, false)
			}
		}
	}
}

export class Prism {
	public colors: number[]
	public vertices: number[]
	public matrix: any

	private n: number
	private height: number
	private radius: number
	private angleStep: number

	constructor(n: number, height: number, radius: number) {
		this.n = n
		this.height = height
		this.radius = radius
		this.angleStep = (2 * Math.PI) / this.n

		this.colors = [0, 0, 0]
		this.vertices = []
		this.matrix = mat4.create()
		this.generatePrism()
	}

	private generatePrism(): void {
		this.generateBases()
		this.generateFaces()
	}

	private generateBases(): void {
		const triangles = this.n - 2
		for (let i = 0; i < 2; i += 1) {
			const y = i === 0 ? this.height / 2 : -(this.height / 2)
			const basePoint = [this.radius, y, 0]

			for (let j = 0; j < triangles; j += 1) {
				let angle = this.angleStep * (j + 1)

				for (let k = 0; k < 3; k += 1) {
					if (!k) {
						this.vertices.push(...basePoint)
						continue
					}

					angle += this.angleStep * (k - 1)

					const x = this.radius * Math.cos(angle)
					const z = this.radius * Math.sin(angle)

					this.vertices.push(x, y, z)
				}
			}
		}
	}

	private generateFaces(): void {
		for (let i = 0; i < this.n; i += 1) {
			const angle = this.angleStep * i

			for (let t = 0; t < 2; t += 1) {
				for (let j = 0; j < 3; j += 1) {
					let y: number
					let currentAngle: number

					if (!t) {
						y = j ? -(this.height / 2) : this.height / 2
						currentAngle = j === 1 ? angle + this.angleStep : angle
					} else {
						y = j === 1 ? -(this.height / 2) : this.height / 2
						currentAngle = j === 0 ? angle - this.angleStep : angle
					}

					const x = this.radius * Math.cos(currentAngle)
					const z = this.radius * Math.sin(currentAngle)

					this.vertices.push(x, y, z)
				}
			}
		}
	}
}
