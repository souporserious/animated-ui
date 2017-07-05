import React, { Component, Children, cloneElement } from 'react'
import PropTypes from 'prop-types'
import { Motion, spring } from 'react-motion'

class Toggle extends Component {
  static propTypes = {
    toggled: PropTypes.bool,
    on: PropTypes.object,
    off: PropTypes.object,
    lazy: PropTypes.bool,
    onRest: PropTypes.func,
  }

  static defaultProps = {
    toggled: true,
    lazy: true,
  }

  state = {
    renderComponent: this.props.lazy && this.props.toggled,
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.lazy && this.props.toggled !== nextProps.toggled) {
      this.setState({ renderComponent: true })
    }
  }

  handleRest = () => {
    if (this.props.lazy) {
      this.setState({ renderComponent: false })
    }
  }

  render() {
    const { toggled, on, off, onRest, lazy, children } = this.props
    const { renderComponent } = this.state
    const child = Children.only(children)
    const style = toggled ? on : off
    return (
      <Motion style={style} onRest={this.handleRest}>
        {interpolated =>
          renderComponent &&
          cloneElement(child, {
            style: {
              ...interpolated,
              ...(child.props.style || {}),
            },
          })}
      </Motion>
    )
  }
}

export default Toggle
