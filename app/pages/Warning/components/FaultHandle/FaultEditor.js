import React, { Component } from 'react';
import E from 'wangeditor'
import http from '../../../../common/http'
import appConfig from '../../../../common/appConfig'
import {message} from 'antd'

// 语言配置
const language = appConfig.language;

// 文本映射
const textMap = {
    zhCN: {
        uploadImageFailed: '上传图片失败',
        bindWorkOrderFailed: '图片绑定工单接口请求失败！'
    },
    en: {
        uploadImageFailed: 'Upload image failed',
        bindWorkOrderFailed: 'Bind work order interface request failed!'
    }
};

const getText = (key) => {
    return textMap[language] ? textMap[language][key] : textMap.zhCN[key];
};
//import { inject, observer } from 'mobx-react'
//import { withRouter } from 'react-router-dom'
let editor
//@withRouter @inject('appStore') @observer
class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editorContent:''
         };
    }
    componentDidMount() {
        this.props.onRef(this);
        const {changeContent,content} = this.props
        const elemMenu = this.refs.editorElemMenu;
        const elemBody = this.refs.editorElemBody;
        editor = new E(elemMenu,elemBody)
        // 使用 onchange 函数监听内容的变化，并实时更新到 state 中
        editor.customConfig.onchange = html => {
            changeContent(editor.txt.html())
        }
        editor.customConfig.menus = [
            'head',  // 标题
            'bold',  // 粗体
            'fontSize',  // 字号
            'fontName',  // 字体
            'italic',  // 斜体
            'underline',  // 下划线
            'strikeThrough',  // 删除线
            'foreColor',  // 文字颜色
            'backColor',  // 背景颜色
            'link',  // 插入链接
            'list',  // 列表
            'justify',  // 对齐方式
            'quote',  // 引用
            'emoticon',  // 表情
            'image',  // 插入图片
            'table',  // 表格
            'undo'  // 撤销
        ]
        editor.customConfig.uploadImgMaxSize = 10 * 1024 * 1024
        editor.customConfig.uploadImgMaxLength = 9
        editor.customConfig.customUploadImg = function (files, insert) {
            let data =new FormData();
            for(var i = 1;i < files.length+1;i ++) {
                data.append(`file${i<9?0:''}`+i,files[i-1]);
            }
            http.post('/fdd/saveImgToLocal',data,
            {
                headers: {
                }
            }
            ).then(
                data=>{
                    if(data.err==0){
                        for(var j=0;j<data.data.length;j++){
                            insert(`${appConfig.serverUrl}/static/files/fddImages/${data.data[j]}`)
                        }
                    }else{
                        message.error(getText('uploadImageFailed'))
                    }
                }
            ).catch(
                err=>{
                    message.error(getText('bindWorkOrderFailed'))
                }
            )
        }
        editor.create()
        editor.txt.html(content)
    };

    clearEditor = ()=>{
        editor.txt.clear()
    }

    render() {
        const {changeContent} = this.props
        return (
            <div>
                <div className="text-area" >
                    <div ref="editorElemMenu"
                         style={{border:"1px solid #ccc"}}
                         className="editorElem-menu">

                    </div>
                    <div
                        style={{
                            padding:"0 10px",
                            // overflowY:"scroll",
                            height:240,
                            border:"1px solid #ccc",
                            borderTop:"none"
                        }}
                        ref="editorElemBody" >
                    </div>
                </div>
            </div>
        );
    }
}

export default Editor;