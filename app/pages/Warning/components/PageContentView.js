import React from 'react'

import s from './PageContentView.css'
import FaultStatisticsView from "../containers/FaultStatisticsViewContainer"
import FaultAnalysisView from "../containers/FaultAnalysisViewContainer"
import FaultHistoryView from "../containers/FaultHistoryViewContainer"
import FaultHandleView from "../containers/FaultHandleViewContainer"

let ContentStyle;
if(localStorage.getItem('serverOmd')=="best"){
    ContentStyle={
        background:"RGB(255,255,255)"
    }
}
let timer
class PageContentView extends React.Component{

    constructor(props){
        super(props)
        this.state={
            name:'',
            key:'',
            toggleUser:0
        }
        this.getContentPage = this.getContentPage.bind(this)
    }

    componentDidMount(){
        timer = setInterval(()=>{
            if (this.state.name != JSON.parse(localStorage.getItem('userInfo')).name) {
                this.setState({
                    toggleUser:1,
                    name:JSON.parse(localStorage.getItem('userInfo')).name
                }) 
            }
        },2000)
        localStorage.setItem('FaultPage',1)
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.name != JSON.parse(localStorage.getItem('userInfo')).name) {
            this.setState({
                key:'',
                name:JSON.parse(localStorage.getItem('userInfo')).name
            })
        }
            this.setState({
                toggleUser:0,
                key:nextProps.selectedKey,
            })
    }

    shouldComponentUpdate(nextProps,nextState){
        return true
    }

    componentWillUnmount(){
        clearInterval(timer)
        localStorage.removeItem('FaultPage')
    }

    getContentPage(){
        let selectedKey = this.state.key
        if(this.state.toggleUser == 1){
            return null
        }else{
            if( selectedKey === 'FaultStatistics' ){
                return <FaultStatisticsView/>
            }else if( selectedKey === 'FaultAnalysis' ){
                return <FaultAnalysisView/>
            }else if( selectedKey === 'FaultHistory' ){
                return <FaultHistoryView/>
            }else if( selectedKey === 'FaultHandle' ){
                return <FaultHandleView/>
            }else{
                return null
            }
        }
    }

    render(){
        return (
            <div className={s['pagecontent-container']} style={ContentStyle} >
                {this.getContentPage()}
            </div>
        )
    }
}

export default PageContentView