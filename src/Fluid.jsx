import React, { Component, Children, cloneElement } from 'react'
import PropTypes from 'prop-types'
import ResizeObserver from 'resize-observer-polyfill'
import Animated from 'animated/lib/targets/react-dom'

class Fluid extends Component {
  static propTypes = {
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['auto'])]),
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['auto'])]),
    onComplete: PropTypes.func,
    render: PropTypes.func,
  }

  state = {
    animatedWidth: new Animated.Value(
      isNaN(this.props.width) ? -1 : this.props.width
    ),
    animatedHeight: new Animated.Value(
      isNaN(this.props.height) ? -1 : this.props.height
    ),
    isAnimating: false,
  }

  measuredWidth = -1
  measuredHeight = -1

  componentWillMount() {
    this.resizeObserver = new ResizeObserver(this.measure)
  }

  componentDidUpdate(lastProps) {
    const { width, height } = this.props

    if (width !== lastProps.width) {
      this.animate({
        animated: this.state.animatedWidth,
        toValue: width === 'auto' ? this.measuredWidth : width,
      })
    }

    if (height !== lastProps.height) {
      this.animate({
        animated: this.state.animatedHeight,
        toValue: height === 'auto' ? this.measuredHeight : height,
      })
    }
  }

  handleRef = node => {
    if (this.resizeObserver) {
      if (node) {
        this.resizeObserver.observe(node)
      } else {
        this.resizeObserver.disconnect(this._node)
      }
    }
    this._node = node
  }

  measure = () => {
    const { animatedWidth, animatedHeight } = this.state
    const { scrollWidth, scrollHeight } = this._node

    if (this.measuredWidth !== scrollWidth) {
      if (this.props.width === 'auto') {
        if (this.measuredWidth === -1 && animatedWidth._value === -1) {
          animatedWidth.setValue(scrollWidth)
        } else {
          this.animate({
            animated: animatedWidth,
            toValue: scrollWidth,
          })
        }
      }
      this.measuredWidth = scrollWidth
      this.forceUpdate()
    }

    if (this.measuredHeight !== scrollHeight) {
      if (this.props.height === 'auto') {
        if (this.measuredHeight === -1 && animatedHeight._value === -1) {
          animatedHeight.setValue(scrollHeight)
        } else {
          this.animate({
            animated: animatedHeight,
            toValue: scrollHeight,
          })
        }
      }
      this.measuredHeight = scrollHeight
      this.forceUpdate()
    }
  }

  animate = ({ animated, toValue }) => {
    this.setState({ isAnimating: true })

    Animated.spring(animated, { toValue }).start(({ finished }) => {
      if (finished) {
        this.setState({ isAnimating: false })
      }
      if (typeof this.props.onComplete === 'function') {
        this.props.onComplete({ finished })
      }
    })
  }

  render() {
    const {
      width,
      height,
      style,
      children,
      render,
      onComplete,
      ...props
    } = this.props
    const { animatedWidth, animatedHeight, isAnimating } = this.state
    const animatedStyles = {}

    if (
      (width === 'auto' && isAnimating) ||
      (width !== 'auto' && typeof width !== 'undefined')
    ) {
      animatedStyles.width = animatedWidth
    }

    if (
      (height === 'auto' && isAnimating) ||
      (height !== 'auto' && typeof height !== 'undefined')
    ) {
      animatedStyles.height = animatedHeight
    }

    if (typeof render === 'function') {
      return render({ childRef: this.handleRef, animatedStyles, isAnimating })
    }

    return (
      <Animated.div
        style={{
          ...animatedStyles,
          ...style,
        }}
        {...props}
      >
        {cloneElement(Children.only(children), { ref: this.handleRef })}
      </Animated.div>
    )
  }
}

export default Fluid
