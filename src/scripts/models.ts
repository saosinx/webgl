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

export function generateSphere(
	radius: number,
	accuracy: number
): {
	vertices: number[]
	colors: number[]
} {
	const n = accuracy
	const vertices = []
	const colors = []

	function getCoords(alpha: number, phi: number): number[] {
		const coords: number[] = []

		const x = radius * Math.cos(phi) * Math.sin(alpha)
		const y = radius * Math.cos(alpha)
		const z = -1 * +(Math.sin(phi) * Math.sin(alpha))
		coords.push(x, y, z)

		return coords
	}

	function getTriangle(
		alpha1: number,
		alpha2: number,
		phi1: number,
		phi2: number,
		left: boolean = false
	): number[] {
		const triangle: number[] = []
		let a: number[]
		let b: number[]
		let c: number[]

		if (left) {
			a = getCoords(alpha1, phi2)
			b = getCoords(alpha2, phi1)
			c = getCoords(alpha1, phi1)
		} else {
			a = getCoords(alpha1, phi2)
			b = getCoords(alpha2, phi2)
			c = getCoords(alpha2, phi1)
		}

		triangle.push(...a, ...b, ...c)

		return triangle
	}

	function getColor() {
		const color: number[] = []
		const r = Math.random()
		const g = Math.random()
		const b = Math.random()

		for (let i = 0; i < 3; i += 1) {
			color.push(r, g, b)
		}

		return color
	}

	for (let j = 0; j < n; j += 1) {
		const phi1 = (2 * Math.PI * j) / n
		const phi2 = (2 * Math.PI * (j + 1)) / n

		for (let i = 0; i < n; i += 1) {
			const alpha1 = (Math.PI * i) / n
			const alpha2 = (Math.PI * (i + 1)) / n

			if (i === 0) {
				vertices.push(...getTriangle(alpha1, alpha2, phi1, phi2))
				colors.push(...getColor())
				continue
			} else if (i === n - 1) {
				vertices.push(...getTriangle(alpha1, alpha2, phi1, phi2, true))
				colors.push(...getColor())
				continue
			}

			const rgb = getColor()
			vertices.push(...getTriangle(alpha1, alpha2, phi1, phi2, true))
			colors.push(...rgb)
			vertices.push(...getTriangle(alpha1, alpha2, phi1, phi2))
			colors.push(...rgb)
		}
	}

	return { vertices, colors }
}

export class Prism {
	public colors: number[]
	public vertices: number[]

	private n: number
	private height: number
	private radius: number
	private angleStep: number

	constructor(n: number, height: number, radius: number) {
		this.n = n
		this.height = height
		this.radius = radius
		this.angleStep = (2 * Math.PI) / this.n

		this.colors = []
		this.vertices = []
		this.generatePrism()
	}

	public generatePrism(): void {
		this.generateBases()
		this.generateFaces()
		this.colors.push(0, 0, 0)
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
