import React, { Component, Children, cloneElement } from 'react'
import PropTypes from 'prop-types'
import Fluid from './Fluid'
import Animated from 'animated/lib/targets/react-dom'

class Collapse extends Component {
  static propTypes = {
    open: PropTypes.bool,
    lazy: PropTypes.bool,
  }

  static defaultProps = {
    lazy: true,
  }

  state = {
    renderComponent: this.props.lazy && this.props.open,
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.lazy && this.props.open !== nextProps.open) {
      this.setState({ renderComponent: true })
    }
  }

  handleComplete = ({ finished }) => {
    if (finished && this.props.lazy && !this.props.open) {
      this.setState({ renderComponent: false })
    }
  }

  render() {
    const { open, lazy, style, children, ...props } = this.props
    return (
      <Fluid
        height={open ? 'auto' : 0}
        onComplete={this.handleComplete}
        render={({ childRef, animatedStyles, isAnimating }) => {
          const collapseStyles = {
            ...animatedStyles,
            ...style,
          }

          if (isAnimating || !open) {
            collapseStyles.overflow = 'hidden'
          }

          return (
            this.state.renderComponent &&
            <Animated.div style={collapseStyles} {...props}>
              {cloneElement(Children.only(children), { ref: childRef })}
            </Animated.div>
          )
        }}
      />
    )
  }
}

export default Collapse
