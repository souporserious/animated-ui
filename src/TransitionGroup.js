// reimplemented from: https://github.com/reactjs/react-transition-group/blob/master/src/TransitionGroup.js
import React, { cloneElement, isValidElement } from 'react'
import PropTypes from 'prop-types'

import { getChildMapping, mergeChildMappings } from './utils/ChildMapping'

const values = Object.values || (obj => Object.keys(obj).map(k => obj[k]))

class TransitionGroup extends React.Component {
  static childContextTypes = {
    transitionGroup: PropTypes.object.isRequired,
  }

  static propTypes = {
    /**
     * `<TransitionGroup>` renders a `<div>` by default. You can change this
     * behavior by providing a `component` prop.
     */
    component: PropTypes.any,

    /**
     * A set of `<Transition>` components, that are toggled `in` and out as they
     * leave. the `<TransitionGroup>` will inject specific transition props, so
     * remember to spread them throguh if you are wrapping the `<Transition>` as
     * with our `<Fade>` example.
     */
    children: PropTypes.node,

    /**
     * A convenience prop that enables or disabled appear animations
     * for all children. Note that specifiying this will override any defaults set
     * on individual children Transitions.
     */

    appear: PropTypes.object,

    /**
     * A convenience prop that enables or disabled enter animations
     * for all children. Note that specifiying this will override any defaults set
     * on individual children Transitions.
     */
    enter: PropTypes.object,

    /**
     * A convenience prop that enables or disabled exit animations
     * for all children. Note that specifiying this will override any defaults set
     * on individual children Transitions.
     */
    exit: PropTypes.object,
  }

  static defaultProps = {
    component: 'div',
  }

  constructor(props, context) {
    super(props, context)

    // Initial children should all be entering, dependent on appear
    this.state = {
      children: getChildMapping(props.children, child =>
        cloneElement(child, {
          in: true,
          appear: this.getProp(child, 'appear', props),
          enter: this.getProp(child, 'enter', props),
          exit: this.getProp(child, 'exit', props),
          onExited: () => {
            if (child.props.onExited) {
              child.props.onExited()
            }
            this.handleExited(child.key)
          },
        })
      ),
    }
  }

  getChildContext() {
    return {
      transitionGroup: { isMounting: !this.appeared },
    }
  }

  getProp(child, prop, props) {
    // use child config unless explictly set by the Group
    return props[prop] != null ? props[prop] : child.props[prop]
  }

  componentDidMount() {
    this.appeared = true
  }

  componentWillReceiveProps(nextProps) {
    const prevChildMapping = this.state.children
    const nextChildMapping = getChildMapping(nextProps.children)
    const children = mergeChildMappings(prevChildMapping, nextChildMapping)

    Object.keys(children).forEach(key => {
      let child = children[key]

      if (!isValidElement(child)) return

      const onExited = () => this.handleExited(key)

      const hasPrev = key in prevChildMapping
      const hasNext = key in nextChildMapping

      const prevChild = prevChildMapping[key]
      const isLeaving = isValidElement(prevChild) && !prevChild.props.in

      // item is new (entering)
      if (hasNext && (!hasPrev || isLeaving)) {
        children[key] = cloneElement(child, {
          onExited,
          in: true,
          exit: this.getProp(child, 'exit', nextProps),
          enter: this.getProp(child, 'enter', nextProps),
        })
      } else if (!hasNext && hasPrev && !isLeaving) {
        // item is old (exiting)
        children[key] = cloneElement(child, { in: false })
      } else if (hasNext && hasPrev && isValidElement(prevChild)) {
        // item hasn't changed transition states
        // copy over the last transition props;
        children[key] = cloneElement(child, {
          onExited,
          in: prevChild.props.in,
          exit: this.getProp(child, 'exit', nextProps),
          enter: this.getProp(child, 'enter', nextProps),
        })
      }
    })
    this.setState({ children })
  }

  handleExited = key => {
    let currentChildMapping = getChildMapping(this.props.children)

    if (key in currentChildMapping) return

    this.setState(state => {
      const children = { ...state.children }
      delete children[key]
      return { children }
    })
  }

  render() {
    const { component: Component, appear, enter, exit, ...props } = this.props
    const { children } = this.state
    return (
      <Component {...props}>
        {values(children)}
      </Component>
    )
  }
}

export default TransitionGroup
