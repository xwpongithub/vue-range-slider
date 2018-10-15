import Slider from './js/vue-range-slider'
import {version} from '../package.json'

Slider.version = version
Slider.install = function(Vue) {
  Vue.component(Slider.name, Slider)
}

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(Slider)
}

export default Slider
