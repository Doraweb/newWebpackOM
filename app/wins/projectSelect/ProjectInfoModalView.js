import React from 'react';
import { Modal ,Switch , Button,Row ,Col,Radio,Tag,Icon} from 'antd'
import moment from 'moment';
import http from '../../common/http';

import s from './ProjectInfoModalView.css'
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const CheckableTag = Tag.CheckableTag;

class ProjectInfoModalView extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            isFavorite : true,
            QRCodeVisible : false,
            QRCodeSrc:''
        }
    }
    
    componentDidMount() {
        
    }
    
    componentWillReceiveProps(nextProps){
        if(nextProps.message){
            let id = 486
            if(window.sessionStorage.userProfile){
                id = JSON.parse(window.sessionStorage.userProfile).id
            }
            this.setState({
                isFavorite : nextProps.message.isFavorite === id ? true : false
            })
        }
        if(nextProps.message.projectId !== this.props.message.projectId) {
            this.props.getCondition(nextProps.message.projectId)
        }
    }
    handleChange(message,checked){ //记住项目选择
        const {reviseFavouriteFn,toggleSwitch} = this.props
        this.setState({
            isFavorite : checked
        })
        toggleSwitch(message.projectId,checked)
        reviseFavouriteFn(message.projectId,checked)
    }
    toggleCondition = () => {
        const {message,toggleCondition} = this.props
        toggleCondition(message.projectId)
    }


    getImgStatus(){
        let status = false
        let promise = new Promise(function(resolve,reject){
            var Img = new Image()
            // 项目图片 static/images/project_img
            let ip = "http://47.100.17.99"
            if(localStorage.getItem('serverOmd')=="best"){
            ip = "http://106.14.226.254"
            }
            Img.src=`${ip}/static/images/project_img/two_dimession_code_${message.projectId}.png`
            Img.addEventListener("load",function(){
                
            })
        })
    }

    createQRCode = () => {
        const {message} = this.props
        let _this = this
        let userId = JSON.parse(sessionStorage.userProfile)['id']
        let ip = "http://47.100.17.99"
        if(localStorage.getItem('serverOmd')=="best"){
        ip = "http://106.14.226.254"
        }
        http.get(`/project/createTwoDimessionCode/${message.projectId}/${userId}`)
        .then(
            data=>{
                if(!data.err){
                    this.setState({
                        QRCodeVisible : !_this.state.QRCodeVisible,
                        QRCodeSrc : ip + "/" + data.msg
                    })
                }else{
                    message.error(data.msg)
                }
            }
        )
    }

    getQRCodeInfo = (url) => {
        const {message} = this.props
        let _this = this
        this.setState({
            QRCodeVisible : !_this.state.QRCodeVisible,
            QRCodeSrc : url
        })
    }

    showQRCode = () => {
        const {message} = this.props
        let _this = this
        let userId = JSON.parse(sessionStorage.userProfile)['id']
        // 先检测图片是否存在
        let ip = "http://47.100.17.99"
        if(localStorage.getItem('serverOmd')=="best"){
        ip = "http://106.14.226.254"
        }
        let status = false
        let url = `${ip}/static/images/project_img/two_dimession_code_${message.projectId}.png`
        var Img = new Image()
        Img.src= url
        Img.addEventListener("load",function(){
            _this.getQRCodeInfo(url)
        })
        Img.addEventListener("error",function(){
            _this.createQRCode()
        })
    }

    createQRCodeContainer = () => {
        const {QRCodeVisible,QRCodeSrc} = this.state
        return (
            <Modal
                visible={QRCodeVisible}
                footer={null}
                onCancel={()=>this.setState({QRCodeVisible:!QRCodeVisible})}
                bodyStyle={{
                    textAlign : 'center'
                }}
            >
                <img className={s['QR-code-img']} src={QRCodeSrc} />
            </Modal>
        )
    }

    render(){
        const { 
            visible , 
            message ,
            toggleModal,
            isManager,
            toggleInnerModal,
            innerType,
            updateMessage,
            getProjects,
            refreshProjectsData,
            focus
        } = this.props

        let picReg = /^http:\/\//
        let ip = "http://47.100.17.99"
        if(localStorage.getItem('serverOmd')=="best"){
          ip = "http://106.14.226.254"
        }
        let pic;
        if(picReg.test(message.projectPic)){
            pic = message.projectPic
        }else{
            pic = ip +"/" + message.projectPic
        }
        return (
            <div>
                <Modal
                    visible={visible}
                    closable={true}
                    onCancel={toggleModal}
                    width={660}
                    footer={null}
                    wrapClassName={s['ant-modal-body']}
                >
                    <div className={ s['project-wrap'] }>
                        <div className={ s['project-header'] } >
                            <h3 className={s['project-title']} >
                                {message.projectName ? message.projectName : 'The project name is unknown'}
                                <span style={{float:'right',marginRight:40}}>ID: {message.projectId}</span>
                            </h3>
                        </div>
                        <div className={s['project-pic-wrap']} >
                            <img src={pic}  className={s['project-pic']} />
                        </div>
                        <div className={s['project-infos']}>
                            <div className={s['project-info']}>
                                <Switch 
                                    checkedChildren={'open'} 
                                    unCheckedChildren={'close'} 
                                    size='small' 
                                    onChange={(checked)=>{this.handleChange(message,checked)}}
                                    checked={this.state.isFavorite} 
                                />
                                <span style={{paddingLeft:20,fontWeight:"bold",color:'#323232'}}>
                                    用户登录后跳过导航直接进入项目
                                </span>
                            </div>
                            <div className={s['project-info']}>
                                <span className={s['project-address']}>
                                    项目地址
                                    :{message.projectAddress ? message.projectAddress : '暂时没有地址信息' }
                                </span>
                            </div>
                            <div className={s['project-info']}>
                                更新时间
                                :{
                                    //根据最后一次接受的时间确定
                                    message.projectlastReceivedTime ?
                                    <span>
                                        <span style={{color:"#13A1F8",marginRight:5}} >
                                            { moment(message.projectlastReceivedTime,'YYYY-MM-DD HH:mm:ss').fromNow('d')}
                                        </span>
                                        前数据更新为最新
                                    </span>
                                    : <span>没有数据</span>
                                }
                            </div>
                            <div className={s['project-info']}>
                                项目标识
                                : {message.nameEn}
                            </div>
                            <div className={s['project-info']}>
                                项目时区
                                : {message.projectTime}
                            </div>
                        </div>
                    </div>
                    {this.createQRCodeContainer()}
                </Modal>
            </div>
        )
    }
}
export default ProjectInfoModalView