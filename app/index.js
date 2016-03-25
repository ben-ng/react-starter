import ReactDOM from 'react-dom'
import React, {Component} from 'react'

class App extends Component {
  constructor () {
    super()

    this.state = {
      counter: 0
    }
  }

  render () {
    return <button onClick={e => {
      e.preventDefault()

      this.setState(oldState => {
        return {
          counter: oldState.counter + 1
        }
      })

    }}>Hello World {this.state.counter}</button>
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
)
