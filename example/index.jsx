import React, {
  Component,
  PureComponent,
  Children,
  createElement,
  cloneElement,
} from 'react'
import PropTypes from 'prop-types'
import ReactDOM, { findDOMNode } from 'react-dom'

import { Collapse, Fluid } from '../src'

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

        <Collapse open={!isOpen} style={{ backgroundColor: 'orange' }}>
          <h1 style={{ margin: 0 }}>This is another title</h1>
        </Collapse>
      </div>
    )
  }
}
ReactDOM.render(<App />, document.getElementById('app'))
