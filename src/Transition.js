// reimplemented from: https://github.com/reactjs/react-transition-group/blob/master/src/Transition.js
import Animated from 'animated/lib/targets/react-dom'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

export const UNMOUNTED = 'unmounted'
export const EXITED = 'exited'
export const ENTERING = 'entering'
export const ENTERED = 'entered'
export const EXITING = 'exiting'

function rehydrateStyles(styles) {}

function buildAnimatedStyles(styles) {
  return Object.keys(styles).reduce(
    (acc, key) => ({
      ...acc,
      [key]: new Animated.Value(styles[key]),
    }),
    {}
  )
}

class Transition extends Component {
  static contextTypes = {
    transitionGroup: PropTypes.object,
  }

  static childContextTypes = {
    transitionGroup: () => {},
  }

  constructor(props, context) {
    super(props, context)

    let parentGroup = context.transitionGroup
    // In the context of a TransitionGroup all enters are really appears
    let appear =
      parentGroup && !parentGroup.isMounting ? props.enter : props.appear

    let initialStatus
    this.nextStatus = null

    if (props.in) {
      if (appear) {
        initialStatus = EXITED
        this.nextStatus = ENTERING
      } else {
        initialStatus = ENTERED
      }
    } else {
      if (props.lazy) {
        initialStatus = UNMOUNTED
      } else {
        initialStatus = EXITED
      }
    }

    this.state = {
      status: initialStatus,
      driver: new Animated.Value(0),
    }

    this.nextCallback = null
  }

  getChildContext() {
    return { transitionGroup: null } // allows for nested Transitions
  }

  componentDidMount() {
    this.updateStatus(true)
  }

  componentWillReceiveProps(nextProps) {
    const { status } = this.state

    if (nextProps.in) {
      if (status === UNMOUNTED) {
        this.setState({ status: EXITED })
      }
      if (status !== ENTERING && status !== ENTERED) {
        this.nextStatus = ENTERING
      }
    } else {
      if (status === ENTERING || status === ENTERED) {
        this.nextStatus = EXITING
      }
    }
  }

  componentDidUpdate() {
    this.updateStatus()
  }

  updateStatus(mounting = false) {
    if (this.nextStatus !== null) {
      // nextStatus will always be ENTERING or EXITING.

      if (this.nextStatus === ENTERING) {
        this.performEnter(mounting)
      } else {
        this.performExit()
      }

      this.nextStatus = null
    } else if (this.props.unmountOnExit && this.state.status === EXITED) {
      this.setState({ status: UNMOUNTED })
    }
  }

  performEnter(mounting) {
    const { appear, enter, exit } = this.props
    const appearing = this.context.transitionGroup
      ? this.context.transitionGroup.isMounting
      : mounting
    const styles = {}

    // no enter animation skip right to ENTERED
    // if we are mounting and running this it means appear _must_ be set
    if (!mounting && !enter) {
      this.setState({ status: ENTERED })
      return
    }

    // set up interpolations
    Object.keys(enter).forEach(key => {
      const enterStyle = enter[key]
      const initialStyle = appearing ? appear[key] : exit[key]
      styles[key] = this.state.driver.interpolate({
        inputRange: [0, 1],
        outputRange: [
          Math.min(enterStyle, initialStyle),
          Math.max(enterStyle, initialStyle),
        ],
      })
    })

    // once interpolations have been set, we can now drive the animation
    this.state.driver.stopAnimation(() => {
      this.setState({ status: ENTERING, styles }, () => {
        Animated.spring(this.state.driver, {
          toValue: 1,
        }).start(({ finished }) => {
          if (finished) {
            this.setState({ status: ENTERED })
          }
        })
      })
    })
  }

  performExit() {
    const { appear, enter, exit } = this.props
    const styles = {}

    // no exit animation skip right to EXITED
    if (!exit) {
      this.setState({ status: EXITED })
      return
    }

    // set up interpolations
    Object.keys(exit).forEach(key => {
      const exitStyle = exit[key]
      const initialStyle = appear ? appear[key] : enter[key]
      styles[key] = this.state.driver.interpolate({
        inputRange: [0, 1],
        outputRange: [
          Math.min(exitStyle, initialStyle),
          Math.max(exitStyle, initialStyle),
        ],
      })
    })

    // once interpolations have been set, we can now drive the animation
    this.state.driver.stopAnimation(() => {
      this.setState({ status: EXITING, styles }, () => {
        Animated.spring(this.state.driver, {
          toValue: 0,
        }).start(({ finished }) => {
          if (finished) {
            this.setState({ status: EXITED }, () => {
              this.props.onExited && this.props.onExited()
            })
          }
        })
      })
    })
  }

  render() {
    const {
      in: inProp,
      lazy,
      appear,
      enter,
      exit,
      style,
      children,
      onEntered,
      onExited,
      ...props
    } = this.props
    const { status, styles } = this.state

    if (status === UNMOUNTED) {
      return null
    }

    return (
      <Animated.div {...props} style={{ ...style, ...styles }}>
        {children}
      </Animated.div>
    )
  }
}

Transition.propTypes = {
  /**
   * Generally a React element to animate, all unknown props on Transition are
   * transfered to the **single** child element.
   *
   * For advanced uses, a `function` child can be used instead of a React element.
   * This function is called with the current transition status
   * ('entering', 'entered', 'exiting', 'exited', 'unmounted'), which can used
   * to apply context specific props to a component.
   *
   * ```jsx
   * <Transition timeout={150}>
   *   {(status) => (
   *     <MyComponent className={`fade fade-${status}`} />
   *   )}
   * </Transition>
   * ```
   */
  // children: PropTypes.oneOfType([
  //   PropTypes.func.isRequired,
  //   PropTypes.element.isRequired,
  // ]).isRequired,

  /**
   * Show the component; triggers the enter or exit states
   */
  in: PropTypes.bool,

  /**
   * Unmount the component (remove it from the DOM) when it is not shown
   */
  lazy: PropTypes.bool,

  /**
   * Styles applied when component appears in DOM
   */
  appear: PropTypes.object,

  /**
   * Styles applied on enter.
   */
  enter: PropTypes.object,

  /**
   * Styles applied on exit.
   */
  exit: PropTypes.object,

  /**
   * Callback fired before the "entering" status is applied.
   *
   * @type Function(node: HtmlElement, isAppearing: bool)
   */
  onEnter: PropTypes.func,

  /**
   * Callback fired after the "entering" status is applied.
   *
   * @type Function(node: HtmlElement, isAppearing: bool)
   */
  onEntering: PropTypes.func,

  /**
   * Callback fired after the "enter" status is applied.
   *
   * @type Function(node: HtmlElement, isAppearing: bool)
   */
  onEntered: PropTypes.func,

  /**
   * Callback fired before the "exiting" status is applied.
   *
   * @type Function(node: HtmlElement)
   */
  onExit: PropTypes.func,

  /**
   * Callback fired after the "exiting" status is applied.
   *
   * @type Function(node: HtmlElement)
   */
  onExiting: PropTypes.func,

  /**
   * Callback fired after the "exited" status is applied.
   *
   * @type Function(node: HtmlElement)
   */
  onExited: PropTypes.func,
}

// Name the function so it is clearer in the documentation
function noop() {}

Transition.defaultProps = {
  in: false,

  lazy: false,

  // onEnter: noop,
  // onEntering: noop,
  // onEntered: noop,
  //
  // onExit: noop,
  // onExiting: noop,
  // onExited: noop,
}

export default Transition
