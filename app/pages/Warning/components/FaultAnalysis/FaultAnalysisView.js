import React from 'react';
import {Table, Button, Input ,message,DatePicker} from 'antd';
import s from './FaultAnalysisView.css'

/*
故障分析
*/
class FaultAnalysisView extends React.Component{
    constructor(props){
        super(props)
    }

    componentDidMount(){
    }

    render(){
        return (
            <div className={s['container']}>
                    故障分析页面
            </div>
        )
    }
}

export default FaultAnalysisView