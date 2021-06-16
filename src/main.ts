import { WCU } from './scripts/webgl-custom-utils'
import { resizeCanvasToDisplaySize } from './scripts/webgl-utils'
import { webGLStart } from './webgl'
import { start } from './canvas2d'
import './index.scss'

const handleLoad = (main: () => void) => {
	WCU.setCanvasStats()

	if (typeof main === 'undefined') {
		return
	}

	main()

	if (WCU.ctx.canvas) {
		resizeCanvasToDisplaySize(WCU.ctx.canvas)
	}
}

window.addEventListener('load', () => handleLoad(start))
window.addEventListener('resize', () => resizeCanvasToDisplaySize(WCU.ctx.canvas))
