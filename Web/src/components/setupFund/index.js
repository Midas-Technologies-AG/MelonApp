import React from 'react';
import { setupFundInvestedFund } from '../../wrapper/melon'

class Fund extends React.Component {

  async componentDidMount() {
    try {
    }
    catch (e) {
      console.error(e.message)
    }
  }

  render() {
    return (
      <div className="setup-fund-view" style={{ flexDirection: 'column' }}>
        <h2>Please proceed to create a new fund</h2>
        <br />
        <input id={"fund-name"} placeholder={'Fund name....'} className="input-value" />
        <br /><br /><br />
        <button onClick={this.setupFund.bind(this)} style={{ backgroundColor: 'black', color: 'white', width: 'auto' }}>SETUP FUND</button>
      </div>
    );
  }

  async setupFund() {
    this.props.toggleLoading(true);
    try {
      var fundName = document.getElementById('fund-name').value
      await setupFundInvestedFund(fundName)
      alert('Fund created successfully');
    }
    catch (e) {
      console.warn(e);
      alert('Failed to create fund');
    }
    this.props.toggleLoading(false);
    window.location.reload(true);
  }
}
export default Fund;