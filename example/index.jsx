import React, {
  Component,
  PureComponent,
  Children,
  createElement,
  cloneElement,
} from 'react'
import PropTypes from 'prop-types'
import ReactDOM, { findDOMNode } from 'react-dom'
import { parseToRgb } from 'polished'

import { Animate, Collapse, Fluid } from '../src'

function toRgbaString(color) {
  const { red, green, blue, alpha = 1 } = parseToRgb(color)
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

function MyComponent({ innerRef, children }) {
  return (
    <div
      ref={innerRef}
      style={{
        padding: 12,
        backgroundColor: 'rebeccapurple',
        color: 'white',
      }}
    >
      {children}
    </div>
  )
}

class App extends Component {
  state = {
    isOpen: true,
    isAuto: false,
    height: 0,
  }
  render() {
    const { height, isAuto, isOpen } = this.state
    return (
      <div>
        <input
          type="number"
          onChange={e => this.setState({ height: +e.target.value })}
          value={height}
        />

        <button onClick={() => this.setState({ isAuto: !isAuto })}>
          Auto Height {isAuto ? 'Off' : 'On'}
        </button>

        <button onClick={() => this.setState({ isOpen: !isOpen })}>
          Collapse Toggle
        </button>

        <Collapse open={isOpen} style={{ backgroundColor: 'orange' }}>
          <div>
            <h1 style={{ margin: 0 }}>React Fluid Container</h1>
            <Fluid
              height={isAuto ? 'auto' : height}
              style={{ overflow: 'hidden', backgroundColor: 'orange' }}
            >
              <div>
                This is som really long text that might brek if it is long
                enough This is som really long text that might brek if it is
                long enough
              </div>
            </Fluid>
          </div>
        </Collapse>

        <Collapse
          open={!isOpen}
          render={({ childRef }) =>
            <MyComponent innerRef={childRef}>
              This is a custom wrapped component using the render prop to pass
              the childRef down properly.
            </MyComponent>}
        />

        <Animate
          style={
            isOpen
              ? {
                  opacity: 1,
                  transform: [{ scale: 1 }, { translateY: 0 }],
                }
              : {
                  opacity: 0,
                  transform: [{ scale: 0.9 }, { translateY: 100 }],
                }
          }
          staticStyles={{
            backgroundColor: 'pink',
          }}
        >
          Animated 💫
        </Animate>

        <Animate
          style={
            isOpen ? { color: 'rgb(0, 0, 0)' } : { color: 'rgb(100, 255, 255)' }
          }
        >
          Color interpolation
        </Animate>

        {/* <Transition
          items={{
            children: 1,
          }}
          enter={{ opacity: 1 }}
          leave={{ opacity: 0 }}
          renderItem={props =>
            <Collapse open={props.style.opacity > 0}>
              <div {...props}>
                {children}
              </div>
            </Collapse>}
        /> */}

        {/* <Transition
          enter={{ opacity: 1 }}
          leave={{ opacity: 0 }}
          renderChild={props =>
            <Collapse open={props.style.opacity > 0}>
              <div {...props}>
                {children}
              </div>
            </Collapse>}
        >
         <div>Cool Beans</div>
         <div>What</div>
        </Transition> */}
      </div>
    )
  }
}
ReactDOM.render(<App />, document.getElementById('app'))
