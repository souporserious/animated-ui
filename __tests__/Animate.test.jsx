import React from 'react'
import { mount } from 'enzyme'
import Animate from '../src/Animate.jsx'

let wrapper = mount(<Animate component='ul' />)

describe('<Animated />', () => {
  it('exists when mounted', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('takes props', () => {
    expect(wrapper.props().component).toEqual('ul')
  })
})
