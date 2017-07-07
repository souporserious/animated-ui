import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Animated from 'animated/lib/targets/react-dom'

const UNIT_TRANSFORMS = [
  'translateX',
  'translateY',
  'translateZ',
  'transformPerspective',
]

class Animate extends Component {
  static propTypes = {
    component: PropTypes.any,
    staticStyles: PropTypes.object,
  }

  static defaultProps = {
    component: 'div',
    type: 'spring',
  }

  state = {
    animatedStyles: { ...this.props.style },
  }

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
        animatedStyles.transformDrivers = currTransform.map((prop, index) => {
          const currKey = Object.keys(prop)[0]
          const currValue = prop[currKey]
          return {
            [currKey]: new Animated.Value(parseFloat(currValue)),
          }
        })

        // interpolate each driver for the real transform value
        animatedStyles.transform = animatedStyles.transformDrivers.map(
          (prop, index) => {
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
          }
        )
      } else if (key === 'color') {
        const currColor = this.props.style.color
        const nextColor = nextProps.style.color
        animatedStyles.colorDriver = new Animated.Value(0)
        animatedStyles.color = animatedStyles.colorDriver.interpolate({
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
        const animatedTransform = this.state.animatedStyles.transformDrivers

        animatedTransform.forEach((prop, index) => {
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
              toValue: parseFloat(currValue),
            }).start()
          }
        })
      } else if (key === 'color') {
        const lastColor = lastProps.style[key]
        const currColor = this.props.style[key]
        const { colorDriver } = this.state.animatedStyles

        if (lastColor !== currColor) {
          AnimatedType(colorDriver, {
            toValue: colorDriver._value > 0 ? 0 : 1,
          }).start()
        }
      } else {
        const lastValue = lastProps.style[key]
        const currValue = this.props.style[key]
        const animatedValue = this.state.animatedStyles[key]

        if (lastValue !== currValue) {
          AnimatedType(animatedValue, { toValue: currValue }).start()
        }
      }
    })
  }

  render() {
    const { component, type, style, staticStyles, ...props } = this.props
    const AnimatedComponent = Animated.createAnimatedComponent(component)
    const {
      transformDrivers,
      colorDriver,
      ...styles
    } = this.state.animatedStyles
    return (
      <AnimatedComponent style={{ ...staticStyles, ...styles }} {...props} />
    )
  }
}

export default Animate
