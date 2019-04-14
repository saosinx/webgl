export function generateCircle(radius: number, accuracy: number): number[] {
	const angle = (360 / accuracy) * (Math.PI / 180)
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
