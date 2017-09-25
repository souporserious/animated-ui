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

import { Collapse, Fluid, Transition, TransitionGroup, Toggle } from '../src'

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
          {this.state.items.map((item, i) => (
            <Transition key={item}>
              <div>
                {item}{' '}
                <button onClick={() => this.handleRemove(i)}>remove</button>
              </div>
            </Transition>
          ))}
        </TransitionGroup>
      </div>
    )
  }
}

class App extends Component {
  state = {
    isOpen: false,
    isAuto: false,
    height: 0,
  }

  setInputRef = c => (this.input = c)

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

        <button
          onClick={() =>
            this.setState(
              { isOpen: !isOpen },
              () => this.input && this.input.focus()
            )}
        >
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
          render={({ childRef }) => (
            <MyComponent innerRef={childRef}>
              This is a custom wrapped component using the render prop to pass
              the childRef down properly.
            </MyComponent>
          )}
        />

        <Toggle
          isOn={isOpen}
          offStyles={{
            opacity: 0,
            transform: [{ scale: 0.9 }, { translateY: 100 }, { rotate: 0 }],
          }}
          onStyles={{
            opacity: 1,
            transform: [{ scale: 1 }, { translateY: 0 }, { rotate: 360 }],
          }}
          staticStyles={{
            backgroundColor: 'pink',
          }}
        >
          Animated 💫
        </Toggle>

        <Toggle
          isOn={isOpen}
          offStyles={{
            backgroundColor: 'orange',
            color: 'blue',
            transform: [{ scale: 0 }],
          }}
          onStyles={{
            backgroundColor: 'blue',
            color: 'orange',
            transform: [{ scale: 1 }],
          }}
        >
          <input
            ref={this.setInputRef}
            type="input"
            defaultValue="Can animate inputs"
          />
        </Toggle>

        <Toggle
          isOn={isOpen}
          offStyles={{
            width: 'auto',
            height: 0,
            color: 'rgba(0, 0, 0, 0.5)',
            backgroundColor: 'orange',
            transform: [{ scale: 0.8 }],
          }}
          onStyles={{
            width: 300,
            height: 'auto',
            color: 'rgba(100, 255, 255, 1)',
            backgroundColor: 'purple',
            transform: [{ scale: 1 }],
          }}
        >
          Color interpolation
        </Toggle>

        <Toggle
          component="input"
          isOn={isOpen}
          offStyles={{
            width: 0,
            color: 'cyan',
            backgroundColor: 'purple',
          }}
          onStyles={{
            width: 100,
            color: 'white',
            backgroundColor: 'orange',
          }}
        />

        {/* <Transition
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
          {isOpen && (
            <Transition key="whatever" style={{ position: 'relative' }}>
              It works!!!!!!
            </Transition>
          )}
        </TransitionGroup>

        <TodoList /> */}

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
