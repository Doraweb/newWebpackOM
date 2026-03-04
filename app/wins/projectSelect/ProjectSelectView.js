// // // //
// 导航页面
// // // // 
import React from 'react'
import {Table,Icon,Button,Layout,Card,Row,Col,Input,Modal} from 'antd'
import moment from 'moment';
import appConfig from '../../common/appConfig'
import { updateServerUrl } from '../../common/appConfig';
const { Header,  Content } = Layout;
const Search = Input.Search

// import UserMenu from '../../../components/PageLayout/UserMenu'

import ProjectInfoModalView from './ProjectInfoModalView'
import s from './ProjectSelectView.css'

// let online =  ip +'/static/images/online.png'
// let leavrline = ip +'/static/images/leaveline.png'


class SelectView extends React.Component{
    constructor(props){
      super(props)

      this.state={
        data : [],                              // 项目数据
        visibleInfo : false,
        message : {},
      }
      this.handleClick = this.handleClick.bind(this)
      this.handleModal = this.handleModal.bind(this)
      this.handleSearch = this.handleSearch.bind(this)
      this.toggleModal = this.toggleModal.bind(this)
      this.updateMessage = this.updateMessage.bind(this)
    }

    countCompare(propertyName){                 //排序函数（根据数组内每个对象元素内的指定的值进行排序）
        return function( projectFirst, projectSecond ){
            let valueFirst = projectFirst[propertyName]
            let valueSecond = projectSecond[propertyName] 
            if(valueFirst > valueSecond){
                return -1
            }else if(valueFirst < valueSecond){
                return 1
            }else{
                return 0
            }
        }
    }

    //注释掉可以解决搜索后，点击详情时项目列表会刷新，展示所有项目的bug
    componentWillReceiveProps(nextProps){
        if(nextProps){
            this.setState({
                data : nextProps.projects
            })
        }
    }

    componentDidMount(){
        let { projects } = this.props
        let { countCompare } = this
        let newProjects = projects.map( (project)=>{
            //根据localstorage中的值添加对应的属性
            project['Count'] = window.localStorage.getItem(project.projectId+'Count') ? parseInt(window.localStorage.getItem(project.projectId+'Count') ) : 0
            return project
        })
        //按时间排序后的数据       
        let TimeData = newProjects.sort(function(a,b){
            return Date.parse(b.projectUpdateTime)-Date.parse(a.projectUpdateTime);  
        })
       
        //时间排序后对Count的排序后得到的数据
        let BetweenTime = []
        let OutTime =[]
        //在线
       TimeData.map((row)=>{
            let NowTime = new Date().getTime() 
            let ProjectTime = new Date(row['projectUpdateTime']).getTime()
            // console.log(NowTime-ProjectTime) 
            if((parseInt(NowTime-ProjectTime)/1000)<3600){
                //在线
                BetweenTime.push(row)
             }else{
                //离线
                OutTime.push(row)
             }
        })
        let AfterBetweenTime = BetweenTime.sort(function(a,b){
            return Date.parse(b.projectUpdateTime)-Date.parse(a.projectUpdateTime);  
        })
        let AfterOutTime = OutTime.sort(function(a,b){
            return Date.parse(b.projectUpdateTime)-Date.parse(a.projectUpdateTime);  
        })
        //最后组合的数组
        let Arr = []
        AfterBetweenTime.sort(countCompare('Count')) //根据增加的点进行排序
        AfterOutTime.sort(countCompare('Count'))
        let LastArr = Arr.concat(AfterBetweenTime,AfterOutTime)
        // upDateProjects(LastArr)             //将排序完的数据交给redux管理
        this.setState({data : LastArr})
    }

    handleModal(item){
        this.toggleModal()                      //切换模态框的显示和消失
        this.setState({                         //模态框数据
            message : item
        })
    }

    toggleModal() {
        this.setState({
            visibleInfo:!this.state.visibleInfo
        })
    }

    handleClick(item){
        appConfig.projectName = item.projectName
        appConfig.projectId = item.projectId        //改变项目id
        appConfig.nameEn = item.nameEn
        window.localStorage.lastSelectedProjectId =  item.projectId
        window.localStorage.lastSelectedProjectName = item.projectName
        window.localStorage.lastSelectedProjectNameEn = item.nameEn
        //记录点击，根据localstorage中的值增加，并保存一个对应的全局count变量
        appConfig[item.projectId+'Count'] = window.localStorage.getItem(item.projectId+'Count') ? parseInt(window.localStorage.getItem(item.projectId+'Count')) + 1 : 1   
        //更新localStorage
        window.localStorage.setItem(item.projectId+'Count',appConfig[item.projectId+'Count'])
        updateServerUrl("p2.inwhile.com:7"+item.projectId,item.projectName);
        this.props.onSubmit({name:"cx",pwd:"DOM.cloud-2016",isRemember:false})
        // this.props.selectProject(String(item.projectId))
        //jump('/pageManage')     //跳转原始数据页面
    }
    
    //搜索数据
    handleSearch(value){
        const {projects} = this.props
        //查找时做一个筛选
        this.setState({
            data : projects.filter(function(item){
                return new RegExp(value,"i").test(item.projectName) || new RegExp(value,"i").test(item.projectId)
            })
        })
    }

    updateMessage(message){
        this.setState({
            message:message
        })
    }
    //在线和离线数据显示
    dataVisible(data){
        let NowTime = new Date().getTime() 
        let ProjectTime = new Date(data).getTime()
        if((parseInt(NowTime-ProjectTime)/1000)<3600){
            //在线
           return true
         }else{
            //离线
            return false
         }
    }
    render(){
        const { visible , projects,handleHide,onSubmit } = this.props
        const { data } = this.state
        let picReg = /^http:\/\//
        let NowTime = new Date().getTime() 
        let ip = "http://47.100.17.99"
        if(localStorage.getItem('serverOmd')=="best"){
        ip = "http://106.14.226.254"
        }
        return (
            <div style={{top:"20%"}}>
                <Modal
                title="项目导航"
                width={1150}
                maskClosable={false}
                visible={this.props.visible}
                onOk={this.register}
                onCancel={this.props.handleHide}
                footer ={null}
            >
              <Layout className={s['layout-project']}>
                  <Content className={s['content-search']}>
                    <div className={s['search-wrap']} >
                        <Search
                            placeholder='请输入搜索内容'
                            onSearch={this.handleSearch}
                        />
                    </div>
                  </Content>
                  <Content className={s['content-project']} >
                    <div className={s['content-wrap']} >
                        {
                            data.map(function(item,index){
                                let pic;
                                if(picReg.test(item.projectPic)){
                                    pic = item.projectPic
                                }else{
                                    pic = ip + '/' + item.projectPic
                                }
                                return (
                                        <Card className={s['project-card']}  bodyStyle={{ padding: 0 }}  key={index} >
                                            <div className={s['project-header']} >
                                                <span className={s['project-name']} >{item.projectName}</span>
                                                {/*<div className={s['project-info']}>
                                                    <img   style={{height:'22px'}} src={this.dataVisible(item.projectUpdateTime)?online:leavrline}/>
                                                    <a className={s['font-info']}  onClick={()=>{this.handleModal(item)}} >
                                                        <Icon type="info-circle-o"/>
                                                    </a>
                                                </div>*/}
                                            </div>
                                            <a className={s['projet-img-w']} onClick={()=>{this.handleClick(item)}} >
                                                <img src={pic} className={s['project-img']} />
                                            </a>
                                        </Card>
                                )
                            }.bind(this))
                        }
                    </div>
                  </Content>
                  {/*
                     <ProjectInfoModalView
                        visible={this.state.visibleInfo}
                        toggleModal={this.toggleModal}
                        message={this.state.message}
                        updateMessage={this.updateMessage}
                    /> 
                  */}
                 
              </Layout>
            </Modal>
            </div>
            
        )
    }
}

export default SelectView