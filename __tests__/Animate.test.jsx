import React from 'react'
import { mount } from 'enzyme'
import Animate from '../src/Animate.jsx'

let wrapper = mount(<Animate />)

describe('<Animated />', () => {
  it('exists', () => {
    expect(wrapper.exists()).toBe(true)
  })
})
