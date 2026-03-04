import React, { Component } from 'react';
import E from 'wangeditor'
//import { inject, observer } from 'mobx-react'
//import { withRouter } from 'react-router-dom'

//@withRouter @inject('appStore') @observer
class GuaranteeText extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
      const {SeachGuaranteeSourceData} = this.props
      this.refs.text.innerHTML = SeachGuaranteeSourceData.content
    }
    render() {
        const {SeachGuaranteeSourceData} = this.props
        return (
            <div>
                <div style={{fontSize:'16px',marginTop:'15px'}}>
                    内容：&nbsp;<div style={{display:'inline'}} ref="text" className="GuaranteeText"></div>
                </div>      
            </div>
            
        );
    }
}

export default GuaranteeText;