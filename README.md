# vue-range-slider
A range slider component based on vue (Vue滑块组件).

[![license](https://img.shields.io/npm/l/express.svg)]()

Can use the slider in vue2.x.

## Todo

- [x] Basis
- [x] Display maximum value & minimum value
- [x] piecewise style
- [x] Compatible with PC and mobile terminal
- [x] Tooltip
- [x] The custom data
- [x] Range
- [x] The vertical component

## Exceptions
if the component initialization in a `v-show="false" / display: none` container or use `transform / animation / margin` to change the location of the component, there may be an exception ( The slider cannot be used, because the component can not initialize the size or slider position ).

The solution:
 1. using `v-if` instead of `v-show` or `display: none`.
 2. use prop `show` to control display.
 3. After the component appears, to call the `refresh` method.
