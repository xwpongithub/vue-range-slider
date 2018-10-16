// Unsharp text [#166](https://github.com/NightCatSama/vue-slider-component/issues/166)
export const roundToDPR = (function () {
  const r = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  return value => Math.round(value * r) / r
})()

export const isMobile = (() => {
  const userAgentInfo = navigator.userAgent.toLowerCase()
  const agents = ["Android", "iPhone",
    "SymbianOS", "Windows Phone",
    "iPad", "iPod"]
  let flag = false
  for (let v = 0; v < agents.length; v++) {
    if (userAgentInfo.indexOf(agents[v].toLowerCase()) > 0) {
      flag = true
      break
    }
  }
  return flag
})()

export function isArray(input) {
  if (Array.prototype.isArray) {
    return Array.isArray(input)
  }
  return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]'
}

export function isDiff(a, b) {
  if (Object.prototype.toString.call(a) !== Object.prototype.toString.call(b)) {
    return true
  } else if (isArray(a) && a.length === b.length) {
    return a.some((v, i) => v !== b[i])
  }
  return a !== b
}

let elementStyle = document.createElement('div').style
let vendor = (() => {
  let transformNames = {
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'transform'
  }
  for (let key in transformNames) {
    if (elementStyle[transformNames[key]] !== undefined) {
      return key
    }
  }
  return false
})()

export function prefixStyle(style) {
  if (vendor === false) {
    return false
  }
  if (vendor === 'standard') {
    if (style === 'transitionEnd') {
      return 'transitionend'
    }
    return style
  }
  return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}

export function addEvent(el, type, fn, capture) {
  el.addEventListener(type, fn, {passive: false, capture: !!capture})
}

export function removeEvent(el, type, fn, capture) {
  el.removeEventListener(type, fn, {passive: false, capture: !!capture})
}
