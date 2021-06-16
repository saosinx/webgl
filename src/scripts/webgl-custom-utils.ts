import { IWCU } from './types'

export const WCU = (function (root) {
	const WCU = {
		_: {
			stats: {},
		},
	} as IWCU

	const math = Math,
		mmax = math.max,
		mmin = math.min,
		abs = math.abs,
		pow = math.pow,
		PI = math.PI,
		round = math.round,
		toFloat = parseFloat,
		toInt = parseInt

	WCU._.viewportRatio = 0
	WCU._.lastTime = 0
	WCU._.frames = 0
	WCU._.fps = 0

	const glob = {
		win: root.window,
		doc: root.window.document,
	}

	WCU._.glob = glob

	function rad(deg: number) {
		return ((deg % 360) * PI) / 180
	}
	function deg(rad: number) {
		return ((rad * 180) / PI) % 360
	}
	function $(selector: string, qs?: boolean) {
		return !qs ? glob.doc.getElementById(selector) : glob.doc.querySelector(selector)
	}

	WCU.sin = angle => math.sin(WCU.rad(angle))
	WCU.tan = angle => math.tan(WCU.rad(angle))
	WCU.cos = angle => math.cos(WCU.rad(angle))
	WCU.asin = num => WCU.deg(math.asin(num))
	WCU.acos = num => WCU.deg(math.acos(num))
	WCU.atan = num => WCU.deg(math.atan(num))

	WCU.setCanvasStats = () => {
		const container = glob.doc.createElement('div')
		container.className = 'canvas-info'

		const fps = glob.doc.createElement('div')
		const frame = glob.doc.createElement('div')
		const time = glob.doc.createElement('div')

		time.className = 'canvas-info__time'
		frame.className = 'canvas-info__frames'
		fps.className = 'canvas-info__fps'

		container.append(time, frame, fps)

		glob.doc.body.appendChild(container)

		WCU._.stats.fps = fps
		WCU._.stats.frame = frame
		WCU._.stats.time = time
	}

	WCU.updateCanvasStats = (time = 0) => {
		WCU._.fps = 1e3 / (time - WCU._.lastTime)
		WCU._.stats.fps.textContent = WCU._.fps.toFixed(1)
		WCU._.stats.frame.textContent = String(++WCU._.frames)
		WCU._.stats.time.textContent = (time / 1e3).toFixed(1)
		WCU._.lastTime = time
		WCU._.viewportRatio = WCU.ctx.drawingBufferHeight / WCU.ctx.drawingBufferWidth
	}

	WCU.rad = rad
	WCU.deg = deg
	WCU._.$ = $
	WCU.ctx = null

	return WCU
})(window || this)
