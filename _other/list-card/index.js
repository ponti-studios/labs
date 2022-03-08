class ListCard extends React.Component {
  
    constructor(props) {
      super(props)
      this.state = {
        input: '',
        list: []
      }
      this.onFormSubmit = this.onFormSubmit.bind(this)
      this.handleChange = this.handleChange.bind(this)
    }
      
    onFormSubmit(event) {
       this.setState({
         input: '',
         list: [
           ...this.state.list,
           { 
               title: this.state.input, 
               description: this.state.input
            }
         ]
       })
    }
    
    handleChange(e) {
      this.setState({ input: e.target.value })
    }
  
    render() {
      const { list, input } = this.state
  
      return <div className="box">
        <h1>Placeholder Title</h1>
        <h3>Placeholder Description</h3>
        
        <ul>
            {
              list.map((item) => (
                  <li key={item.title}>
                    <p> Title: {item.title} </p>
                    <p> Description: {item.description} </p>
                  </li>
              ))
            }
        </ul>

        <input value={input} onChange={this.handleChange}></input>
        
        <button disabled={input.length === 0} onClick={this.onFormSubmit}>
          Add
        </button>
      </div>;
    }
  }
  
  const el = document.querySelector("#root");
  ReactDOM.render(<ListCard />, el);