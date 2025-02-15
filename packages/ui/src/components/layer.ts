import { UIInterface, UiConfig } from '../types'

export const render = (it: UIInterface, config: UiConfig) => {
  const watermark = config.theme?.watermark
  if (!watermark) return

  const wm = (it.$watermark = document.createElement('img'))

  for (const key in watermark.style) {
    wm.style[key as any] = watermark.style[key]!
  }

  for (const key in watermark.attrs) {
    wm.setAttribute(key, watermark.attrs[key]!)
  }

  wm.src = watermark.src
  it.$root.appendChild(wm)
}
