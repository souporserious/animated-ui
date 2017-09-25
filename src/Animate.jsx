import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Animated from 'animated/lib/targets/react-dom'

const UNIT_TRANSFORMS = [
  'translateX',
  'translateY',
  'translateZ',
  'transformPerspective',
]

const COLOR_PROPS = [
  'backgroundColor',
  'borderColor',
  'borderBottomColor',
  'borderLeftColor',
  'borderRightColor',
  'borderTopColor',
  'color',
  'fill',
  'stroke',
]

class Animate extends Component {
  static propTypes = {
    component: PropTypes.any,
    config: PropTypes.object,
    staticStyles: PropTypes.object,
    type: PropTypes.string,
  }

  static defaultProps = {
    component: 'div',
    config: {},
    type: 'spring',
  }

  state = { animatedStyles: { ...this.props.style } }

  colorDrivers = {}

  transformDrivers = []

  componentWillReceiveProps(nextProps) {
    this.setState({ animatedStyles: this.createAnimatedStyles(nextProps) })
  }

  componentDidUpdate(lastProps) {
    this.animateStyles(lastProps)
  }

  createAnimatedStyles(nextProps) {
    return Object.keys(nextProps.style).reduce((acc, key) => {
      const animatedStyles = { ...acc }
      if (key === 'transform') {
        const currTransform = this.props.style.transform
        const nextTransform = nextProps.style.transform

        // create a driver for each transform
        this.transformDrivers = currTransform.map((prop, index) => {
          const currKey = Object.keys(prop)[0]
          const currValue = prop[currKey]
          return {
            [currKey]: new Animated.Value(parseFloat(currValue)),
          }
        })

        // interpolate each driver for the real transform value
        animatedStyles.transform = this.transformDrivers.map((prop, index) => {
          const driverKey = Object.keys(prop)[0]
          const driverValue = prop[driverKey]

          const currProp = currTransform[index]
          const currKey = Object.keys(currProp)[0]
          const currValue = currProp[currKey]

          const nextProp = nextTransform[index]
          const nextKey = Object.keys(nextProp)[0]
          const nextValue = nextProp[nextKey]

          // determine the min and max ranges so we can interpolate them
          const minInput = Math.min(
            parseFloat(currValue),
            parseFloat(nextValue)
          )
          const maxInput = Math.max(
            parseFloat(currValue),
            parseFloat(nextValue)
          )
          let minOutput =
            minInput === parseFloat(currValue) ? currValue : nextValue
          let maxOutput =
            maxInput === parseFloat(currValue) ? currValue : nextValue

          // add pixel unit if a untiless value was passed to a unit transform
          if (
            UNIT_TRANSFORMS.indexOf(driverKey) > -1 &&
            (!isNaN(minOutput) || !isNaN(maxOutput))
          ) {
            minOutput += 'px'
            maxOutput += 'px'
          }

          return {
            [driverKey]: driverValue.interpolate({
              inputRange: [minInput, maxInput],
              outputRange: [minOutput, maxOutput],
            }),
          }
        })
      } else if (COLOR_PROPS.indexOf(key) > -1) {
        const currColor = this.props.style[key]
        const nextColor = nextProps.style[key]
        this.colorDrivers[key] = new Animated.Value(0)
        animatedStyles[key] = this.colorDrivers[key].interpolate({
          inputRange: [0, 1],
          outputRange: [currColor, nextColor],
        })
      } else {
        const currValue = this.props.style[key]
        const animatedValue = this.state.animatedStyles[key]
        animatedStyles[key] =
          animatedValue.constructor === Animated.Value
            ? animatedValue
            : new Animated.Value(currValue)
      }
      return animatedStyles
    }, {})
  }

  animateStyles(lastProps) {
    const AnimatedType = Animated[this.props.type]

    Object.keys(this.props.style).forEach(key => {
      if (key === 'transform') {
        const lastTransform = lastProps.style.transform
        const currTransform = this.props.style.transform
        this.transformDrivers.forEach((prop, index) => {
          const driverKey = Object.keys(prop)[0]
          const driverValue = prop[driverKey]

          const lastProp = lastTransform[index]
          const lastKey = Object.keys(lastProp)[0]
          const lastValue = lastProp[lastKey]

          const currProp = currTransform[index]
          const currKey = Object.keys(currProp)[0]
          const currValue = currProp[currKey]

          if (parseFloat(lastValue) !== parseFloat(currValue)) {
            AnimatedType(driverValue, {
              ...this.props.config,
              toValue: parseFloat(currValue),
            }).start()
          }
        })
      } else if (COLOR_PROPS.indexOf(key) > -1) {
        const lastColor = lastProps.style[key]
        const currColor = this.props.style[key]
        const colorDriver = this.colorDrivers[key]
        if (lastColor !== currColor) {
          AnimatedType(colorDriver, {
            ...this.props.config,
            toValue: colorDriver._value > 0 ? 0 : 1,
          }).start()
        }
      } else {
        const lastValue = lastProps.style[key]
        const currValue = this.props.style[key]
        const animatedValue = this.state.animatedStyles[key]

        if (lastValue !== currValue) {
          AnimatedType(animatedValue, {
            ...this.props.config,
            toValue: currValue,
          }).start()
        }
      }
    })
  }

  render() {
    const { component, type, style, staticStyles, ...props } = this.props
    const AnimatedComponent = Animated.createAnimatedComponent(component)
    return (
      <AnimatedComponent
        style={{ ...staticStyles, ...this.state.animatedStyles }}
        {...props}
      />
    )
  }
}

export default Animate
