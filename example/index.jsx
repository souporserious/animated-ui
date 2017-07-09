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

import { Animate, Collapse, Fluid, Transition, TransitionGroup } from '../src'

// // enter, appear, leave
// <TransitionGroup renderChild={(child, state) => <Collaps isOpen={state.entered}>{child}</Collaps>}>
//   <div>Cool</div>
//   <div>Cool</div>
//   <div>Cool</div>
// </TransitionGroup>

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

class TodoList extends React.Component {
  constructor(props) {
    super(props)
    this.state = { items: ['hello', 'world', 'click', 'me'] }
  }
  handleAdd() {
    const newItems = this.state.items.concat([prompt('Enter some text')])
    this.setState({ items: newItems })
  }
  handleRemove(i) {
    let newItems = this.state.items.slice()
    newItems.splice(i, 1)
    this.setState({ items: newItems })
  }
  render() {
    return (
      <div>
        <button onClick={() => this.handleAdd()}>Add Item</button>
        <TransitionGroup enter={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {this.state.items.map((item, i) =>
            <Transition key={item}>
              <div>
                {item}{' '}
                <button onClick={() => this.handleRemove(i)}>remove</button>
              </div>
            </Transition>
          )}
        </TransitionGroup>
      </div>
    )
  }
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
            <h1 style={{ margin: 0 }}>Collapse</h1>
            <Fluid
              height={isAuto ? 'auto' : height}
              style={{ overflow: 'hidden', backgroundColor: 'orange' }}
            >
              <div>
                This is some really long text that might brek if it is long
                enough. This is some more really long text that might brek if it
                is long enough.
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

        <Transition
          in={isOpen}
          enter={{ opacity: 1, top: 0 }}
          exit={{ opacity: 0, top: 20 }}
          style={{ position: 'relative' }}
        >
          <div>It works!!!!!!</div>
        </Transition>

        <TransitionGroup
          enter={{ opacity: 1, top: 0 }}
          exit={{ opacity: 0, top: 20 }}
        >
          {isOpen &&
            <Transition key="whatever" style={{ position: 'relative' }}>
              It works!!!!!!
            </Transition>}
        </TransitionGroup>

        <TodoList />

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
