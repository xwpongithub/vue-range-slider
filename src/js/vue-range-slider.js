import {roundToDPR, isMobile, isArray, isDiff, prefixStyle, addEvent, removeEvent} from './utils'

const transform = prefixStyle('transform')
const transitionDuration = prefixStyle('transitionDuration')
const transitionEnd = prefixStyle('transitionEnd')

const EVENT_TOUCH_START = 'touchstart'
const EVENT_TOUCH_MOVE = 'touchmove'
const EVENT_TOUCH_END = 'touchend'
const EVENT_TOUCH_CANCEL = 'touchcancel'

const EVENT_MOUSE_DOWN = 'mousedown'
const EVENT_MOUSE_MOVE = 'mousemove'
const EVENT_MOUSE_UP = 'mouseup'
const EVENT_MOUSE_LEAVE = 'mouseleave'

const EVENT_KEY_DOWN = 'keydown'
const EVENT_KEY_UP = 'keyup'
const EVENT_RESIZE = 'resize'

export default {
  name: 'vue-range-slider',
  props: {
    // 是否显示组件
    show: {
      type: Boolean,
      default: true
    },
    // 值
    value: {
      type: [String, Number, Array, Object],
      default: 0
    },
    // 最小值
    min: {
      type: Number,
      default: 0
    },
    // 最大值
    max: {
      type: Number,
      default: 100
    },
    // 分段间隔
    step: {
      type: Number,
      default: 1
    },
    // 组件宽度
    width: {
      type: [Number, String],
      default: 'auto'
    },
    // 组件高度
    height: {
      type: [Number, String],
      default: 6
    },
    // 滑块大小
    dotSize: {
      type: Number,
      default: 16
    },
    dotWidth: {
      type: Number,
      required: false
    },
    dotHeight: {
      type: Number,
      required: false
    },
    stopPropagation: {
      type: Boolean,
      default: false
    },
    // 事件类型
    eventType: {
      type: String,
      default: 'auto'
    },
    // 是否实时计算组件布局
    realTime: {
      type: Boolean,
      default: false
    },
    // 是否显示工具提示
    tooltip: {
      type: [String, Boolean],
      default: 'always',
      validator(val) {
        return ['hover', 'always', false].indexOf(val) > -1
      }
    },
    // 组件方向
    direction: {
      type: String,
      default: 'horizontal',
      validator(val) {
        return ['horizontal', 'vertical'].indexOf(val) > -1
      }
    },
    // 是否反向组件
    reverse: {
      type: Boolean,
      default: false
    },
    // 是否不可用
    disabled: {
      type: [Boolean, Array],
      default: false
    },
    piecewiseLabel: {
      type: Boolean,
      default: false
    },
    piecewise: {
      type: Boolean,
      default: false
    },
    // 进度条是否可拖拽（只限范围模式）
    processDraggable: {
      type: Boolean,
      default: false
    },
    // 是否可点击的
    clickable: {
      type: Boolean,
      default: true
    },
    // 是否固定距离
    fixed: {
      type: Boolean,
      default: false
    },
    // 是否为开发环境（打印错误）
    debug: {
      type: Boolean,
      default: true
    },
    // 最小范围
    minRange: {
      type: Number
    },
    // 最大范围
    maxRange: {
      type: Number
    },
    tooltipMerge: {
      type: Boolean,
      default: true
    },
    // 是否开启初始动画
    startAnimation: {
      type: Boolean,
      default: false
    },
    // 是否在拖拽结束后同步值
    lazy: {
      type: Boolean,
      default: false
    },
    // 在范围模式中，是否允许交叉
    enableCross: {
      type: Boolean,
      default: true
    },
    // 动画速度比
    speed: {
      type: Number,
      default: 0.5
    },
    useKeyboard: {
      type: Boolean,
      default: false
    },
    actionsKeyboard: {
      type: Array,
      default() {
        return [(i) => i - 1, (i) => i + 1]
      }
    },
    data: Array,
    formatter: [String, Function],
    mergeFormatter: [String, Function],
    // 工具提示方向
    tooltipDir: [Array, String],
    // 工具提示样式
    tooltipStyle: [Array, Object, Function],
    // 滑块样式
    sliderStyle: [Array, Object, Function],
    // 键盘控制时，算滑块获得焦点时样式
    focusStyle: [Array, Object, Function],
    // 组件禁用状态下样式
    disabledStyle: Object,
    // 进度条样式
    processStyle: Object,
    // 组件背景样式
    bgStyle: Object,
    piecewiseStyle: Object,
    piecewiseActiveStyle: Object,
    disabledDotStyle: [Array, Object, Function],
    labelStyle: Object,
    labelActiveStyle: Object
  },
  data() {
    return {
      currentValue: 0,
      size: 0,
      fixedValue: 0,
      focusSlider: 0,
      currentSlider: 0,
      flag: false,
      processFlag: false,
      processSign: false,
      keydownFlag: false,
      focusFlag: false,
      dragFlag: false,
      crossFlag: false,
      isComponentExists: true,
      isMounted: false
    }
  },
  render(h) {
    const sliderConBlocks = []

    // dot
    if (this.isRange) {
      const dot0 = h('div', {
        ref: 'dot0',
        staticClass: 'slider-dot',
        class: [this.tooltipStatus, {
          'slider-dot-focus': this.focusFlag && this.focusSlider === 0,
          'slider-dot-dragging': this.flag && this.currentSlider === 0,
          'slider-dot-disabled': !this.boolDisabled && this.disabledArray[0]
        }],
        style: this.dotStyles
      }, [
        this._t('dot', [
          h('div', {
            staticClass: 'slider-dot-handle',
            style: [
              (!this.boolDisabled && this.disabledArray[0]) ? this.disabledDotStyles[0] : null,
              this.sliderStyles[0],
              this.focusFlag && this.focusSlider === 0 ? this.focusStyles[0]: null
            ]
          })
        ], {
          index: 0,
          value: this.val[0],
          disabled: this.disabledArray[0]
        }),
        h('div', {
          ref: 'tooltip0',
          staticClass: 'slider-tooltip-wrap',
          class: `slider-tooltip-${this.tooltipDirection[0]}`
        }, [
          this._t('tooltip', [
            h('span', {
              staticClass: 'slider-tooltip',
              style: this.tooltipStyles[0]
            }, this.formatter ? this.formatting(this.val[0]) : this.val[0])
          ], {
            value: this.val[0],
            index: 0,
            disabled: !this.boolDisabled && this.disabledArray[0]
          })
        ])
      ])
      sliderConBlocks.push(dot0)

      const dot1 = h('div', {
        ref: 'dot1',
        staticClass: 'slider-dot',
        class: [this.tooltipStatus, {
          'slider-dot-focus': this.focusFlag && this.focusSlider === 1,
          'slider-dot-dragging': this.flag && this.currentSlider === 1,
          'slider-dot-disabled': !this.boolDisabled && this.disabledArray[1]
        }],
        style: this.dotStyles
      }, [
        this._t('dot', [
          h('div', {
            staticClass: 'slider-dot-handle',
            style: [
              (!this.boolDisabled && this.disabledArray[1]) ? this.disabledDotStyles[1] : null,
              this.sliderStyles[1],
              this.focusFlag && this.focusSlider === 1 ? this.focusStyles[1]: null
            ]
          })
        ], {
          index: 1,
          value: this.val[1],
          disabled: this.disabledArray[1]
        }),
        h('div', {
          ref: 'tooltip1',
          staticClass: 'slider-tooltip-wrap',
          class: `slider-tooltip-${this.tooltipDirection[1]}`
        }, [
          this._t('tooltip', [
            h('span', {
              staticClass: 'slider-tooltip',
              style: this.tooltipStyles[1]
            }, this.formatter ? this.formatting(this.val[1]) : this.val[1])
          ], {
            value: this.val[1],
            index: 1,
            disabled: !this.boolDisabled && this.disabledArray[1]
          })
        ])
      ])
      sliderConBlocks.push(dot1)
    } else {
      const dot = h('div', {
        ref: 'dot',
        staticClass: 'slider-dot',
        class: [
          this.tooltipStatus,
          {
            'slider-dot-focus': this.focusFlag && this.focusSlider === 0,
            'slider-dot-dragging': this.flag && this.currentSlider === 0
          }
        ],
        style: this.dotStyles
      }, [
        this._t('dot', [
          h('div', {
            staticClass: 'slider-dot-handle',
            style: [
              this.sliderStyles,
              this.focusFlag && this.focusSlider === 0 ? this.focusStyles : null
            ]
          })
        ], {
          value: this.val,
          disabled: this.boolDisabled
        }),
        h('div', {
          staticClass: 'slider-tooltip-wrap',
          class: `slider-tooltip-${this.tooltipDirection}`
        }, [
          this._t('tooltip', [
            h('span', {
                staticClass: 'slider-tooltip',
                style: this.tooltipStyles
              },
              this.formatter ? this.formatting(this.val) : this.val
            )
          ], {
            value: this.val
          })
        ])
      ])
      sliderConBlocks.push(dot)
    }

    // piecewise
    const dotWrapLen = this.piecewiseDotWrap.length
    const ulBlock = h('ul', {
      staticClass: 'slider-piecewise'
    }, this._l(this.piecewiseDotWrap, (item, i) => {
      const piecewiseDot = []
      if (this.piecewise) {
        piecewiseDot.push(h('span', {
          staticClass: 'piecewise-dot',
          style: [this.piecewiseStyle, item.inRange ? this.piecewiseActiveStyle : null]
        }))
      }

      const piecewiseLabel = []
      if (this.piecewiseLabel) {
        piecewiseLabel.push(h('span', {
          staticClass: 'piecewise-label',
          style: [this.labelStyle, item.inRange ? this.labelActiveStyle : null]
        }, item.label))
      }

      return h('li', {
        key: i,
        staticClass: 'piecewise-item',
        style: [this.piecewiseDotStyle, item.style]
      }, [
        this._t('piecewise', piecewiseDot , {
          label: item.label,
          index: i,
          first: i === 0,
          last: i === dotWrapLen - 1,
          active: item.inRange
        }),
        this._t('label', piecewiseLabel, {
          label: item.label,
          index: i,
          first: i === 0,
          last: i === dotWrapLen - 1,
          active: item.inRange
        })
      ])
    }))
    sliderConBlocks.push(ulBlock)

    // process
    const processBlock = h('div', {
      ref: 'process',
      staticClass: 'slider-process',
      class: {
        'slider-process-draggable': this.isRange && this.processDraggable
      },
      style: this.processStyle,
      on: {
        click: e => this.processClick(e)
      }
    }, [
      h('div', {
        ref: 'mergedTooltip',
        staticClass: 'merged-tooltip slider-tooltip-wrap',
        class: `slider-tooltip-${this.isRange ? this.tooltipDirection[0] : this.tooltipDirection}`,
        style: this.tooltipMergedPosition
      }, [
        this._t('tooltip', [
          h('span', {
              staticClass: 'slider-tooltip',
              style: this.tooltipStyles
            }, this.mergeFormatter ? this.mergeFormatting(this.val[0], this.val[1]) : (this.formatter ? (this.val[0] === this.val[1] ? this.formatting(this.val[0]) : `${this.formatting(this.val[0])} - ${this.formatting(this.val[1])}`) : (this.val[0] === this.val[1] ? this.val[0] : `${this.val[0]} - ${this.val[1]}`))
          )
        ], {
          value: this.val,
          merge: true
        })
      ])
    ])
    sliderConBlocks.push(processBlock)

    // <input type="range">
    if (!this.isRange && !this.data) {
      sliderConBlocks.push(h('input', {
        staticClass: 'slider-input',
        attrs: {
          type: 'range',
          min: this.min,
          max: this.max
        },
        domProps: {
          value: this.val
        },
        on: {
          input: e => this.val = e.target.value
        }
      }))
    }

    return h('div', {
      ref: 'wrap',
      staticClass: 'vue-range-slider slider-component',
      class: [this.flowDirection, this.disabledClass, this.stateClass, {'slider-has-label': this.piecewiseLabel}],
      style: [this.wrapStyles, this.boolDisabled ? this.disabledStyle : null],
      directives: [
        {
          name: 'show',
          value: this.show
        }
      ],
      on: {
        click: e => this.wrapClick(e)
      }
    }, [
      h('div', {
        ref: 'elem',
        staticClass: 'slider',
        style: [this.elemStyles, this.bgStyle],
        attrs: {
          'aria-hidden': true
        }
      }, sliderConBlocks)
    ])
  },
  computed: {
    val: {
      get() {
        return this.data ? (this.isRange ? [this.data[this.currentValue[0]], this.data[this.currentValue[1]]] : this.data[this.currentValue]) : this.currentValue
      },
      set(val) {
        if (this.data) {
          if (this.isRange) {
            const index0 = this.data.indexOf(val[0])
            const index1 = this.data.indexOf(val[1])
            if (index0 > -1 && index1 > -1) {
              this.currentValue = [index0, index1]
            }
          } else {
            const index = this.data.indexOf(val)
            if (index > -1) {
              this.currentValue = index
            }
          }
        } else {
          this.currentValue = val
        }
      }
    },
    currentIndex() {
      if (this.isRange) {
        return this.data ? this.currentValue : [this.getIndexByValue(this.currentValue[0]), this.getIndexByValue(this.currentValue[1])]
      } else {
        return this.getIndexByValue(this.currentValue)
      }
    },
    tooltipMergedPosition() {
      if (!this.isMounted) return {}
      const tooltipDirection = this.tooltipDirection[0]
      const dot0 = this.$refs.dot0
      if (dot0) {
        let style = {}
        if (this.direction === 'vertical') {
          style[tooltipDirection] = `-${(this.dotHeightVal / 2) - (this.width / 2) + 9}px`
        } else {
          style[tooltipDirection] = `-${(this.dotWidthVal / 2) - (this.height / 2) + 9}px`
          style['left'] = `50%`
        }
        return style
      }
    },
    tooltipDirection() {
      const dir = this.tooltipDir || (this.direction === 'vertical' ? 'left' : 'top')
      if (isArray(dir)) {
        return this.isRange ? dir : dir[1]
      } else {
        return this.isRange ? [dir, dir] : dir
      }
    },
    piecewiseDotWrap() {
      if (!this.piecewise && !this.piecewiseLabel) {
        return false
      }
      let arr = []
      for (let i = 0; i <= this.total; i++) {
        let style = this.direction === 'vertical' ? {
          bottom: `${this.gap * i - this.width / 2}px`,
          left: 0
        } : {
          left: `${this.gap * i - this.height / 2}px`,
          top: 0
        }
        let index = this.reverse ? (this.total - i) : i
        let label = this.data ? this.data[index] : (this.spacing * index) + this.min
        arr.push({
          style,
          label: this.formatter ? this.formatting(label) : label,
          inRange: index >= this.indexRange[0] && index <= this.indexRange[1]
        })
      }
      return arr
    },
    total() {
      if (this.data) {
        return this.data.length - 1
      } else if (Math.floor((this.maximum - this.minimum) * this.multiple) % (this.step * this.multiple) !== 0) {
        this.printError('Prop[step] is illegal, Please make sure that the step can be divisible')
      }
      return (this.maximum - this.minimum) / this.step
    },
    piecewiseDotStyle() {
      return this.direction === 'vertical' ? {
        width: `${this.width}px`,
        height: `${this.width}px`
      } : {
        width: `${this.height}px`,
        height: `${this.height}px`
      }
    },
    dotStyles() {
      return this.direction === 'vertical' ? {
        width: `${this.dotWidthVal}px`,
        height: `${this.dotHeightVal}px`,
        left: `${(-(this.dotWidthVal - this.width) / 2)}px`
      } : {
        width: `${this.dotWidthVal}px`,
        height: `${this.dotHeightVal}px`,
        top: `${(-(this.dotHeightVal - this.height) / 2)}px`
      }
    },
    sliderStyles() {
      if (isArray(this.sliderStyle)) {
        return this.isRange ? this.sliderStyle : this.sliderStyle[1]
      } else if (typeof this.sliderStyle === 'function') {
        return this.sliderStyle(this.val, this.currentIndex)
      } else {
        return this.isRange ? [this.sliderStyle, this.sliderStyle] : this.sliderStyle
      }
    },
    tooltipStyles() {
      if (isArray(this.tooltipStyle)) {
        return this.isRange ? this.tooltipStyle : this.tooltipStyle[1]
      } else if (typeof this.tooltipStyle === 'function') {
        return this.tooltipStyle(this.val, this.currentIndex)
      } else {
        return this.isRange ? [this.tooltipStyle, this.tooltipStyle] : this.tooltipStyle
      }
    },
    focusStyles() {
      if (isArray(this.focusStyle)) {
        return this.isRange ? this.focusStyle : this.focusStyle[1]
      } else if (typeof this.focusStyle === 'function') {
        return this.focusStyle(this.val, this.currentIndex)
      } else {
        return this.isRange ? [this.focusStyle, this.focusStyle] : this.focusStyle
      }
    },
    disabledDotStyles() {
      const disabledStyle = this.disabledDotStyle
      if (isArray(disabledStyle)) {
        return disabledStyle
      } else if (typeof disabledStyle === 'function') {
        const style = disabledStyle(this.val, this.currentIndex)
        return isArray(style) ? style : [style, style]
      } else if (disabledStyle) {
        return [disabledStyle, disabledStyle]
      } else {
        return [{
          backgroundColor: '#ccc'
        }, {
          backgroundColor: '#ccc'
        }]
      }
    },
    elemStyles() {
      return this.direction === 'vertical' ? {
        width: `${this.width}px`,
        height: '100%'
      } : {
        height: `${this.height}px`
      }
    },
    wrapStyles() {
      return this.direction === 'vertical' ? {
        height: typeof this.height === 'number' ? `${this.height}px` : this.height,
        padding: `${this.dotHeightVal / 2}px ${this.dotWidthVal / 2}px`
      } : {
        width: typeof this.width === 'number' ? `${this.width}px` : this.width,
        padding: `${this.dotHeightVal / 2}px ${this.dotWidthVal / 2}px`
      }
    },
    stateClass() {
      return {
        'slider-state-process-drag': this.processFlag,
        'slider-state-drag': this.flag && !this.processFlag && !this.keydownFlag,
        'slider-state-focus': this.focusFlag
      }
    },
    tooltipStatus() {
      return this.tooltip === 'hover' && this.flag ? 'slider-always' : this.tooltip ? `slider-${this.tooltip}` : ''
    },
    tooltipClass() {
      return [`slider-tooltip-${this.tooltipDirection}`, 'slider-tooltip']
    },
    minimum() {
      return this.data ? 0 : this.min
    },
    maximum() {
      return this.data ? (this.data.length - 1) : this.max
    },
    multiple() {
      const decimals = `${this.step}`.split('.')[1]
      return decimals ? Math.pow(10, decimals.length) : 1
    },
    indexRange() {
      return this.isRange ? this.currentIndex : [0, this.currentIndex]
    },
    spacing() {
      return this.data ? 1 : this.step
    },
    gap() {
      return this.size / this.total
    },
    dotWidthVal() {
      return typeof this.dotWidth === 'number' ? this.dotWidth : this.dotSize
    },
    dotHeightVal() {
      return typeof this.dotHeight === 'number' ? this.dotHeight : this.dotSize
    },
    disabledArray() {
      return isArray(this.disabled) ? this.disabled : [this.disabled, this.disabled]
    },
    boolDisabled() {
      return this.disabledArray.every(b => b === true)
    },
    disabledClass() {
      return this.boolDisabled ? 'slider-disabled' : ''
    },
    flowDirection() {
      return `slider-${this.direction + (this.reverse ? '-reverse' : '')}`
    },
    isRange() {
      return isArray(this.value)
    },
    isDisabled() {
      return this.eventType === 'none' ? true : this.boolDisabled
    },
    isFixed() {
      return this.fixed || this.minRange
    },
    position() {
      return this.isRange ? [(this.currentValue[0] - this.minimum) / this.spacing * this.gap, (this.currentValue[1] - this.minimum) / this.spacing * this.gap] : ((this.currentValue - this.minimum) / this.spacing * this.gap)
    },
    limit() {
      return this.isRange ? this.isFixed ? [[0, (this.total - this.fixedValue) * this.gap], [this.fixedValue * this.gap, this.size]] : [[0, this.position[1]], [this.position[0], this.size]] : [0, this.size]
    },
    valueLimit() {
      return this.isRange ? this.isFixed ? [[this.minimum, this.maximum - (this.fixedValue * (this.spacing * this.multiple)) / this.multiple], [this.minimum + (this.fixedValue * (this.spacing * this.multiple)) / this.multiple, this.maximum]] : [[this.minimum, this.currentValue[1]], [this.currentValue[0], this.maximum]] : [this.minimum, this.maximum]
    },
    idleSlider() {
      return this.currentSlider === 0 ? 1 : 0
    },
    slider() {
      return this.isRange ? [this.$refs.dot0, this.$refs.dot1] : this.$refs.dot
    }
  },
  methods: {
    setValue(val, noCb, speed) {
      if (isDiff(this.val, val)) {
        const resetVal = this.limitValue(val)
        this.val = this.isRange ? resetVal.concat() : resetVal
        this.computedFixedValue()
        this.syncValue(noCb)
      }
      this.$nextTick(() => this.setPosition(speed))
    },
    setIndex(val) {
      if (isArray(val) && this.isRange) {
        let value
        if (this.data) {
          value = [this.data[val[0]], this.data[val[1]]]
        } else {
          value = [this.getValueByIndex(val[0]), this.getValueByIndex(val[1])]
        }
        this.setValue(value)
      } else {
        val = this.getValueByIndex(val)
        if (this.isRange) {
          this.currentSlider = val > ((this.currentValue[1] - this.currentValue[0]) / 2 + this.currentValue[0]) ? 1 : 0
        }
        this.setCurrentValue(val)
      }
    },
    wrapClick(e) {
      if (this.isDisabled || !this.clickable || this.processFlag || this.dragFlag) return false
      const pos = this.getPos(e)
      if (this.isRange) {
        if (this.disabledArray.every(b => b === false)) {
          this.currentSlider = pos > ((this.position[1] - this.position[0]) / 2 + this.position[0]) ? 1 : 0
        } else if (this.disabledArray[0]) {
          if (pos < this.position[0]) return false
          this.currentSlider = 1
        } else if (this.disabledArray[1]) {
          if (pos > this.position[1]) return false
          this.currentSlider = 0
        }
      }
      if (this.disabledArray[this.currentSlider]) {
        return false
      }
      this.setValueOnPos(pos)
      if (this.isRange && this.tooltipMerge) {
        const timer = setInterval(this.handleOverlapTooltip, 16.7)
        setTimeout(() => window.clearInterval(timer), this.speed * 1000)
      }
    },
    processClick(e) {
      if (this.fixed) e.stopPropagation()
    },
    syncValue(noCb) {
      let val = this.isRange ? this.val.concat() : this.val
      this.$emit('input', val)
      this.keydownFlag && this.$emit('on-keypress', val)
      noCb || this.$emit('slide-end', val)
    },
    getPos(e) {
      this.realTime && this.getStaticData()
      return this.direction === 'vertical' ? (this.reverse ? (e.pageY - this.offset) : (this.size - (e.pageY - this.offset))) : (this.reverse ? (this.size - (e.pageX - this.offset)) : (e.pageX - this.offset))
    },
    setValueOnPos(pos, isDrag) {
      const range = this.isRange ? this.limit[this.currentSlider] : this.limit
      const valueRange = this.isRange ? this.valueLimit[this.currentSlider] : this.valueLimit
      const index = Math.round(pos / this.gap)
      if (pos >= range[0] && pos <= range[1]) {
        const v = this.getValueByIndex(index)
        this.setTransform(pos)
        this.setCurrentValue(v, isDrag)
        if (this.isRange && (this.fixed || this.isLessRange(pos, index))) {
          this.setTransform(pos + ((this.fixedValue * this.gap) * (this.currentSlider === 0 ? 1 : -1)), true)
          this.setCurrentValue((v * this.multiple + (this.fixedValue * this.spacing * this.multiple * (this.currentSlider === 0 ? 1 : -1))) / this.multiple, isDrag, true)
        }
      } else {
        const anotherSlider = pos < range[0] ? 0 : 1
        const currentSlider = anotherSlider === 0 ? 1 : 0
        this.setTransform(range[anotherSlider])
        this.setCurrentValue(valueRange[anotherSlider])
        if (this.isRange && (this.fixed || this.isLessRange(pos, index))) {
          this.setTransform(this.limit[this.idleSlider][anotherSlider], true)
          this.setCurrentValue(this.valueLimit[this.idleSlider][anotherSlider], isDrag, true)
        } else if (this.isRange && (this.enableCross || this.crossFlag) && !this.isFixed && !this.disabledArray[anotherSlider] && this.currentSlider === currentSlider) {
          this.focusSlider = anotherSlider
          this.currentSlider = anotherSlider
        }
      }
      this.crossFlag = false
    },
    setCurrentValue(val, isDrag, isIdleSlider) {
      const slider = isIdleSlider ? this.idleSlider : this.currentSlider
      if (val < this.minimum || val > this.maximum) return false
      if (this.isRange) {
        if (isDiff(this.currentValue[slider], val)) {
          this.currentValue.splice(slider, 1, val)
          if (!this.lazy || !this.flag) {
            this.syncValue()
          }
        }
      } else if (isDiff(this.currentValue, val)) {
        this.currentValue = val
        if (!this.lazy || !this.flag) {
          this.syncValue()
        }
      }
      isDrag || this.setPosition()
    },
    setPosition(speed) {
      this.flag || this.setTransitionTime(speed === undefined ? this.speed : speed)
      if (this.isRange) {
        this.setTransform(this.position[0], this.currentSlider === 1)
        this.setTransform(this.position[1], this.currentSlider === 0)
      } else {
        this.setTransform(this.position)
      }
      this.flag || this.setTransitionTime(0)
    },
    setTransform(val, isIdleSlider) {
      const slider = isIdleSlider ? this.idleSlider : this.currentSlider
      const value = roundToDPR((this.direction === 'vertical' ? ((this.dotHeightVal / 2) - val) : (val - (this.dotWidthVal / 2))) * (this.reverse ? -1 : 1))
      const translateValue = this.direction === 'vertical' ? `translateY(${value}px)` : `translateX(${value}px)`
      const processSize = this.fixed ? `${this.fixedValue * this.gap}px` : `${slider === 0 ? this.position[1] - val : val - this.position[0]}px`
      const processPos = this.fixed ? `${slider === 0 ? val : (val - this.fixedValue * this.gap)}px` : `${slider === 0 ? val : this.position[0]}px`
      if (this.isRange) {
        this.slider[slider].style[transform] = translateValue
        if (this.direction === 'vertical') {
          this.$refs.process.style.height = processSize
          this.$refs.process.style[this.reverse ? 'top' : 'bottom'] = processPos
        } else {
          this.$refs.process.style.width = processSize
          this.$refs.process.style[this.reverse ? 'right' : 'left'] = processPos
        }
      } else {
        this.slider.style[transform] = translateValue
        if (this.direction === 'vertical') {
          this.$refs.process.style.height = `${val}px`
          this.$refs.process.style[this.reverse ? 'top' : 'bottom'] = 0
        } else {
          this.$refs.process.style.width = `${val}px`
          this.$refs.process.style[this.reverse ? 'right' : 'left'] = 0
        }
      }
    },
    setTransitionTime(time) {
      // In order to avoid browser merge style and modify together
      time || this.$refs.process.offsetWidth
      if (this.isRange) {
        const sliderLen = this.slider.length
        for (let i = 0; i < sliderLen; i++) {
          this.slider[i].style[transitionDuration] = `${time}s`
        }
        this.$refs.process.style[transitionDuration] = `${time}s`
      } else {
        this.slider.style[transitionDuration] = `${time}s`
        this.$refs.process.style[transitionDuration] = `${time}s`
      }
    },
    computedFixedValue() {
      if (!this.isFixed) {
        this.fixedValue = 0
        return false
      }
      this.fixedValue = this.currentIndex[1] - this.currentIndex[0]
      this.fixedValue = Math.max(this.fixed ? this.currentIndex[1] - this.currentIndex[0] : 0, this.minRange || 0)
    },
    limitValue(val) {
      if (this.data) {
        return val
      }
      const inRange = v => {
        if (v < this.min) {
          this.printError(`The value of the slider is ${val}, the minimum value is ${this.min}, the value of this slider can not be less than the minimum value`)
          return this.min
        } else if (v > this.max) {
          this.printError(`The value of the slider is ${val}, the maximum value is ${this.max}, the value of this slider can not be greater than the maximum value`)
          return this.max
        }
        return v
      }
      if (this.isRange) {
        return val.map(v => inRange(v))
      } else {
        return inRange(val)
      }
    },
    getStaticData() {
      if (this.$refs.elem) {
        this.size = this.direction === 'vertical' ? this.$refs.elem.offsetHeight : this.$refs.elem.offsetWidth
        this.offset = this.direction === 'vertical' ? (this.$refs.elem.getBoundingClientRect().top + window.pageYOffset || document.documentElement.scrollTop) : this.$refs.elem.getBoundingClientRect().left
      }
    },
    handleOverlapTooltip () {
      const isDirectionSame = this.tooltipDirection[0] === this.tooltipDirection[1]
      if (this.isRange && isDirectionSame) {
        const tooltip0 = this.reverse ? this.$refs.tooltip1 : this.$refs.tooltip0
        const tooltip1 = this.reverse ? this.$refs.tooltip0 : this.$refs.tooltip1
        const tooltip0Rect = tooltip0.getBoundingClientRect()
        const tooltip1Rect = tooltip1.getBoundingClientRect()

        const tooltip0Right = tooltip0Rect.right
        const tooltip1Left = tooltip1Rect.left

        const tooltip0Y = tooltip0Rect.top
        const tooltip1Y = tooltip1Rect.top + tooltip1Rect.height

        const horizontalOverlap = this.direction === 'horizontal' && tooltip0Right > tooltip1Left
        const verticalOverlap = this.direction === 'vertical' && tooltip1Y > tooltip0Y

        if (horizontalOverlap || verticalOverlap) {
          this.handleDisplayMergedTooltip(true)
        } else {
          this.handleDisplayMergedTooltip(false)
        }
      }
    },
    handleDisplayMergedTooltip (show) {
      const tooltip0 = this.$refs.tooltip0
      const tooltip1 = this.$refs.tooltip1
      const mergedTooltip = this.$refs.process.getElementsByClassName('merged-tooltip')[0]
      if (show) {
        tooltip0.style.visibility = 'hidden'
        tooltip1.style.visibility = 'hidden'
        mergedTooltip.style.visibility = 'visible'
      } else {
        tooltip0.style.visibility = 'visible'
        tooltip1.style.visibility = 'visible'
        mergedTooltip.style.visibility = 'hidden'
      }
    },
    isLessRange(pos, index) {
      if (!this.isRange || (!this.minRange && !this.maxRange)) {
        return false
      }
      const diff = this.currentSlider === 0 ? this.currentIndex[1] - index : index - this.currentIndex[0]
      if (this.minRange && diff <= this.minRange) {
        this.fixedValue = this.minRange
        return true
      }
      if (this.maxRange && diff >= this.maxRange) {
        this.fixedValue = this.maxRange
        return true
      }
      this.computedFixedValue()
      return false
    },
    getValueByIndex(index) {
      return ((this.spacing * this.multiple) * index + (this.minimum * this.multiple)) / this.multiple
    },
    getIndexByValue(value) {
      return Math.round((value - this.minimum) * this.multiple) / (this.spacing * this.multiple)
    },
    formatting(value) {
      return typeof this.formatter === 'string' ? this.formatter.replace(/{value}/, value) : this.formatter(value)
    },
    mergeFormatting(value1, value2) {
      return typeof this.mergeFormatter === 'string' ? this.mergeFormatter.replace(/{(value1|value2)}/g, (_, key) => key === 'value1' ? value1 : value2) : this.mergeFormatter(value1, value2)
    },
    _start(e, index = 0, isProcess) {
      if (this.disabledArray[index]) {
        return false
      }
      if (this.stopPropagation) {
        e.stopPropagation()
      }
      if (this.isRange) {
        this.currentSlider = index
        if (isProcess) {
          if (!this.processDraggable) {
            return false
          }
          this.processFlag = true
          this.processSign = {
            pos: this.position,
            start: this.getPos((e.targetTouches && e.targetTouches[0]) ? e.targetTouches[0] : e)
          }
        }
        if (!this.enableCross && this.val[0] === this.val[1]) {
          this.crossFlag = true
        }
      }
      if (!isProcess && this.useKeyboard) {
        this.focusFlag = true
        this.focusSlider = index
      }
      this.flag = true
      this.$emit('drag-start', this)
    },
    _move(e) {
      // e.preventDefault() // NOTE: COMMENTED, BREAKS SELECTING THINGS ON PAGE
      if (this.stopPropagation) {
        e.stopPropagation()
      }
      if (!this.flag) return false
      if (e.targetTouches && e.targetTouches[0]) e = e.targetTouches[0]
      if (this.processFlag) {
        this.currentSlider = 0
        this.setValueOnPos(this.processSign.pos[0] + this.getPos(e) - this.processSign.start, true)
        this.currentSlider = 1
        this.setValueOnPos(this.processSign.pos[1] + this.getPos(e) - this.processSign.start, true)
      } else {
        this.dragFlag = true
        this.setValueOnPos(this.getPos(e), true)
      }
      if (this.isRange && this.tooltipMerge) {
        this.handleOverlapTooltip()
      }
    },
    _end(e) {
      if (this.stopPropagation) {
        e.stopPropagation()
      }
      if (this.flag) {
        this.$emit('drag-end', this)
        if (this.lazy && isDiff(this.val, this.value)) {
          this.syncValue()
        }
      } else {
        return false
      }
      this.flag = false
      this.$nextTick(() => {
        this.crossFlag = false
        this.dragFlag = false
        this.processFlag = false
      })
      this.setPosition()
    },
    blurSlider(e) {
      const dot = this.isRange ? this.$refs[`dot${this.focusSlider}`] : this.$refs.dot
      if (!dot || dot === e.target || dot.contains(e.target)) {
        return false
      }
      this.focusFlag = false
    },
    handleKeydown(e) {
      if (!this.useKeyboard) {
        return false
      }
      const keyCode = e.which || e.keyCode
      switch (keyCode) {
        case 37:
        case 40:
          e.preventDefault()
          // e.stopPropagation()
          this.keydownFlag = true
          this.flag = true
          this.changeFocusSlider(this.actionsKeyboard[0])
          break
        case 38:
        case 39:
          e.preventDefault()
          // e.stopPropagation()
          this.keydownFlag = true
          this.flag = true
          this.changeFocusSlider(this.actionsKeyboard[1])
          break
        default:
          break
      }
    },
    handleKeyup() {
      if (this.keydownFlag) {
        this.keydownFlag = false
        this.flag = false
      }
    },
    changeFocusSlider(fn) {
      if (this.isRange) {
        let arr = this.currentIndex.map((index, i) => {
          if (i === this.focusSlider || this.fixed) {
            const val = fn(index)
            const range = this.fixed ? this.valueLimit[i] : [0, this.total]
            if (val <= range[1] && val >= range[0]) {
              return val
            }
          }
          return index
        })
        if (arr[0] > arr[1]) {
          this.focusSlider = this.focusSlider === 0 ? 1 : 0
          arr = arr.reverse()
        }
        this.setIndex(arr)
      } else {
        this.setIndex(fn(this.currentIndex))
      }
    },
    bindEvents() {
      const me = this
      this.processStartFn = function(e) {
        me._start(e, 0, true)
      }
      this.dot0StartFn = function(e) {
        me._start(e, 0)
      }
      this.dot1StartFn = function(e) {
        me._start(e, 1)
      }
      if (isMobile) {
        addEvent(this.$refs.process, EVENT_TOUCH_START, this.processStartFn)

        addEvent(document, EVENT_TOUCH_MOVE, this._move)
        addEvent(document, EVENT_TOUCH_END, this._end)
        addEvent(document, EVENT_TOUCH_CANCEL, this._end)

        if (this.isRange) {
          addEvent(this.$refs.dot0, EVENT_TOUCH_START, this.dot0StartFn)
          addEvent(this.$refs.dot1, EVENT_TOUCH_START, this.dot1StartFn)
        } else {
          addEvent(this.$refs.dot, EVENT_TOUCH_START, this._start)
        }
      } else {
        addEvent(this.$refs.process, EVENT_MOUSE_DOWN, this.processStartFn)

        addEvent(document, EVENT_MOUSE_DOWN, this.blurSlider)
        addEvent(document, EVENT_MOUSE_MOVE, this._move)
        addEvent(document, EVENT_MOUSE_UP, this._end)
        addEvent(document, EVENT_MOUSE_LEAVE, this._end)

        if (this.isRange) {
          addEvent(this.$refs.dot0, EVENT_MOUSE_DOWN, this.dot0StartFn)
          addEvent(this.$refs.dot1, EVENT_MOUSE_DOWN, this.dot1StartFn)
        } else {
          addEvent(this.$refs.dot, EVENT_MOUSE_DOWN, this._start)
        }
      }
      addEvent(document, EVENT_KEY_DOWN, this.handleKeydown)
      addEvent(document, EVENT_KEY_UP, this.handleKeyup)
      addEvent(window, EVENT_RESIZE, this.refresh)
      if (this.isRange && this.tooltipMerge) {
        addEvent(this.$refs.dot0, transitionEnd, this.handleOverlapTooltip)
        addEvent(this.$refs.dot1, transitionEnd, this.handleOverlapTooltip)
      }
    },
    unbindEvents() {
      if (isMobile) {
        removeEvent(this.$refs.process, EVENT_TOUCH_START, this.processStartFn)
        removeEvent(document, EVENT_TOUCH_MOVE, this._move)
        removeEvent(document, EVENT_TOUCH_END, this._end)
        removeEvent(document, EVENT_TOUCH_CANCEL, this._end)

        if (this.isRange) {
          removeEvent(this.$refs.dot0, EVENT_TOUCH_START, this.dot0StartFn)
          removeEvent(this.$refs.dot1, EVENT_TOUCH_START, this.dot1StartFn)
        } else {
          removeEvent(this.$refs.dot, EVENT_TOUCH_START, this._start)
        }
      } else {
        removeEvent(this.$refs.process, EVENT_MOUSE_DOWN, this.processStartFn)
        removeEvent(document, EVENT_MOUSE_DOWN, this.blurSlider)
        removeEvent(document, EVENT_MOUSE_MOVE, this._move)
        removeEvent(document, EVENT_MOUSE_UP, this._end)
        removeEvent(document, EVENT_MOUSE_LEAVE, this._end)

        if (this.isRange) {
          removeEvent(this.$refs.dot0, EVENT_MOUSE_DOWN, this.dot0StartFn)
          removeEvent(this.$refs.dot1, EVENT_MOUSE_DOWN, this.dot1StartFn)
        } else {
          removeEvent(this.$refs.dot, EVENT_MOUSE_DOWN, this._start)
        }
      }
      removeEvent(document, EVENT_KEY_DOWN, this.handleKeydown)
      removeEvent(document, EVENT_KEY_UP, this.handleKeyup)
      removeEvent(window, EVENT_RESIZE, this.refresh)
      if (this.isRange && this.tooltipMerge) {
        removeEvent(this.$refs.dot0, transitionEnd, this.handleOverlapTooltip)
        removeEvent(this.$refs.dot1, transitionEnd, this.handleOverlapTooltip)
      }
    },
    refresh() {
      if (this.$refs.elem) {
        this.getStaticData()
        this.computedFixedValue()
        this.setPosition()
        this.unbindEvents()
        this.bindEvents()
      }
    },
    printError(msg) {
      if (this.debug) {
        console.error(`[VueSlider error]: ${msg}`)
      }
    }
  },
  mounted() {
    this.isComponentExists = true
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return this.printError('window or document is undefined, can not be initialization.')
    }
    this.$nextTick(() => {
      this.getStaticData()
      this.setValue(this.limitValue(this.value), true, this.startAnimation ? this.speed : 0)
      this.bindEvents()
      if (this.isRange && this.tooltipMerge && !this.startAnimation) {
        this.handleOverlapTooltip()
      }
    })
    this.isMounted = true
  },
  watch: {
    value(val) {
      this.flag || this.setValue(val, true)
    },
    show(bool) {
      if (bool && !this.size) {
        this.$nextTick(this.refresh)
      }
    },
    max(val) {
      if (val < this.min) {
        return this.printError('The maximum value can not be less than the minimum value.')
      }
      const resetVal = this.limitValue(this.val)
      this.setValue(resetVal)
      this.refresh()
    },
    min(val) {
      if (val > this.max) {
        return this.printError('The minimum value can not be greater than the maximum value.')
      }
      const resetVal = this.limitValue(this.val)
      this.setValue(resetVal)
      this.refresh()
    },
    fixed() {
      this.computedFixedValue()
    },
    minRange() {
      this.computedFixedValue()
    }
  },
  beforeDestroy() {
    this.isComponentExists = false
    this.unbindEvents()
    this.refresh()
  },
  deactivated() {
    this.isComponentExists = false
    this.unbindEvents()
    this.refresh()
  }
}
