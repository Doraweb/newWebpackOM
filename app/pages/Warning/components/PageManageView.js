import React from 'react'

import s from './PageManageView.css'
import { Menu, Icon } from 'antd';
const MenuItem = Menu.Item

/**
 * 页面导航栏容器
 * 
 * @class PageManageView
 * @extends {React.Component}
 */

 let MenuStyle,MenuItemStyle,toggleClass;
if(localStorage.getItem('serverOmd')=="best"){
    MenuStyle={
        background:"RGB(240,240,240)",
        color:"#000"
    }
    MenuItemStyle={
        borderBottom:"1px solid RGB(155,155,155)"
    }
}else{
    MenuStyle={
        width:120
    }
}


class PageManageView extends React.Component{
    constructor(props){
        super(props)
        
        this.choseMenuItem = this.choseMenuItem.bind(this)
    }
    //切换页面
    choseMenuItem = (value) => {
        this.props.choseMenuItem(value.key)
    }

    render(){
        return (
            <div className={s['pagemanage-container']}>
                <Menu 
                    className={toggleClass}
                    selectedKeys={[this.props.selectedKey]}
                    onClick={this.choseMenuItem}
                    style={MenuStyle}
                >  
                    <MenuItem key="FaultHandle" style={MenuItemStyle}><Icon type="solution" />工单管理</MenuItem>
                    <MenuItem key="FaultStatistics" style={MenuItemStyle}><Icon type="file-search" />工单统计</MenuItem>
                    {/* <MenuItem key="FaultAnalysis" style={MenuItemStyle}>故障分析</MenuItem>
                    <MenuItem key="FaultHistory" style={MenuItemStyle}>历史故障</MenuItem> */}
                </Menu>
            </div>
        )
    }
}

export default PageManageView