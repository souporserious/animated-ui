import React, { Component, createElement } from 'react'
import PropTypes from 'prop-types'
import Animated from 'animated/lib/targets/react-dom'

const UNIT_TRANSFORMS = [
  'translateX',
  'translateY',
  'translateZ',
  'transformPerspective',
]

const DEGREE_TRANFORMS = [
  'rotate',
  'rotateX',
  'rotateY',
  'rotateZ',
  'skewX',
  'skewY',
  'scaleZ',
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

class Toggle extends Component {
  static propTypes = {
    component: PropTypes.any,
    config: PropTypes.object,
    type: PropTypes.string,
    isOn: PropTypes.bool,
    onStyles: PropTypes.object,
    offStyles: PropTypes.object,
    staticStyles: PropTypes.object,
  }

  static defaultProps = {
    component: 'div',
    config: {},
    type: 'spring',
    isOn: false,
    lazy: false,
  }

  state = {
    renderComponent: this.props.lazy ? this.props.isOn : true,
  }

  animatingKeys = {}

  animatedStyles = {}

  colorDrivers = {}

  height = null

  node = null

  transformDrivers = []

  width = null

  componentDidMount() {
    this.animatedStyles = this.createAnimatedStyles()
    this.animateStyles(this.props.isOn, true)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.lazy && this.props.isOn !== nextProps.isOn) {
      this.setState({ renderComponent: true })
    }
  }

  componentDidUpdate(lastProps) {
    if (lastProps.isOn !== this.props.isOn) {
      this.animateStyles(this.props.isOn)
    }
  }

  createAnimatedStyles() {
    return Object.keys(this.props.offStyles).reduce((acc, key) => {
      const animatedStyles = { ...acc }
      if (key === 'transform') {
        const offTransform = this.props.offStyles.transform
        const onTransform = this.props.onStyles.transform
        // create a driver for each transform
        this.transformDrivers = offTransform.map((prop, index) => {
          const key = Object.keys(prop)[0]
          return {
            key,
            driver: new Animated.Value(0),
            offValue: offTransform[index][key],
            onValue: onTransform[index][key],
          }
        })
        // interpolate each driver for the real transform value
        animatedStyles.transform = this.transformDrivers.map(
          ({ driver, key, offValue, onValue }) => {
            if (UNIT_TRANSFORMS.indexOf(key) > -1) {
              offValue += 'px'
              onValue += 'px'
            } else if (DEGREE_TRANFORMS.indexOf(key) > -1) {
              offValue += 'deg'
              onValue += 'deg'
            }
            return {
              [key]: driver.interpolate({
                inputRange: [0, 1],
                outputRange: [offValue, onValue],
              }),
            }
          }
        )
      } else if (COLOR_PROPS.indexOf(key) > -1) {
        const driver = new Animated.Value(0)
        const offColor = this.props.offStyles[key]
        const onColor = this.props.onStyles[key]
        this.colorDrivers[key] = driver
        animatedStyles[key] = driver.interpolate({
          inputRange: [0, 1],
          outputRange: [offColor, onColor],
        })
      } else {
        const offValue = this.props.offStyles[key]
        if (key === 'width' || key === 'height') {
          animatedStyles[key] = new Animated.Value(
            offValue === 'auto' ? this[key] : offValue
          )
        } else {
          animatedStyles[key] = new Animated.Value(offValue)
        }
      }
      return animatedStyles
    }, {})
  }

  animate = (key, instant) => {
    this.animatingKeys[key] = true
    return ({ driver, toValue }) => {
      if (instant) {
        driver.setValue(toValue)
      } else {
        Animated[this.props.type](driver, {
          ...this.props.config,
          toValue,
        }).start(({ finished }) => {
          if (finished) {
            delete this.animatingKeys[key]
            if (
              Object.keys(this.animatingKeys).length === 0 &&
              this.props.lazy &&
              !this.props.isOn
            ) {
              this.setState({ renderComponent: false })
            }
          }
        })
      }
    }
  }

  animateStyles(isOn, instant) {
    Object.keys(this.animatedStyles).forEach(key => {
      const runAnimation = this.animate(key, instant)
      if (key === 'transform') {
        this.transformDrivers.forEach(({ driver }) => {
          runAnimation({
            driver,
            toValue: isOn ? 1 : 0,
          })
        })
      } else if (COLOR_PROPS.indexOf(key) > -1) {
        runAnimation({
          driver: this.colorDrivers[key],
          toValue: isOn ? 1 : 0,
        })
      } else {
        const nextValue = isOn
          ? this.props.onStyles[key]
          : this.props.offStyles[key]
        let toValue = nextValue
        if (nextValue === 'auto' && (key === 'width' || key === 'height')) {
          toValue = this[key]
        }
        runAnimation({
          driver: this.animatedStyles[key],
          toValue,
        })
      }
    })
  }

  setRef = component => {
    if (component && component.refs.node) {
      this.node = component.refs.node
      if (this.node) {
        const width = this.node.scrollWidth
        const height = this.node.scrollHeight
        if (!this.width) {
          this.width = width
        }
        if (!this.height) {
          this.height = height
        }
      }
    }
  }

  render() {
    const {
      component,
      config,
      isOn,
      lazy,
      offStyles,
      onStyles,
      type,
      staticStyles,
      ...props
    } = this.props
    return (
      this.state.renderComponent &&
      createElement(Animated.createAnimatedComponent(component), {
        ref: this.setRef,
        style: { ...staticStyles, ...this.animatedStyles },
        ...props,
      })
    )
  }
}

export default Toggle
