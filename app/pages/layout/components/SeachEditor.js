import React, { Component } from 'react';
import E from 'wangeditor'
//import { inject, observer } from 'mobx-react'
//import { withRouter } from 'react-router-dom'
import S from './SeachEditor'
import http from '../../../common/http'
import appConfig from '../../../common/appConfig'
import {message} from 'antd'
//@withRouter @inject('appStore') @observer

class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editorContent:''
         };
    }
    componentDidMount() {
        const {content,changeContent} = this.props
        const elemMenu = this.refs.editorElemMenu1;
        const elemBody = this.refs.editorElemBody1;
        const editor = new E(elemMenu,elemBody)
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
            'video',  // 插入视频
            'code',  // 插入代码
            'undo',  // 撤销
            'redo'  // 重复
        ]
        editor.customConfig.colors = [
            '#000000',
            '#eeece0',
            '#1c487f',
            '#4d80bf',
            '#c24f4a',
            '#8baa4a',
            '#7b5ba1',
            '#46acc8',
            '#f9963b',
            '#ffffff'
        ]
        editor.customConfig.uploadImgMaxSize = 10 * 1024 * 1024
        editor.customConfig.uploadImgMaxLength = 9
        editor.customConfig.customUploadImg = function (files, insert) {
            let data =new FormData();
            for(var i = 1;i < files.length+1;i ++) {
                data.append(`file${i<9?0:''}`+i,files[i-1]);
            }
            http.post('/fix/insertImage',data,
            {
                headers: {
                }
            }
            ).then(
                data=>{
                    if(data.err==0){
                        for(var j=0;j<data.data.length;j++){
                            insert(`${appConfig.serverUrl}/static/images/fix/${data.data[j]}`)
                        }
                    }else{
                        message.error(data.msg)
                    }
                }
            ).catch(
                err=>{
                    message.error(data.msg)
                }
            )
        }
        editor.create()
        editor.txt.html(content)
    };
    render() {
        const {content,changeContent} = this.props
        return (
            <div className="yjwangEdito">
                <div className='text-area'>
                    <div ref="editorElemMenu1"
                         style={{border:"1px solid #ccc"}}
                    >
                    </div>
                    <div
                        style={{
                            padding:"0 10px",
                            // overflowY:"scroll",
                            height:240,
                            border:"1px solid #ccc",
                            borderTop:"none"
                        }}
                        ref="editorElemBody1">
                    </div>
                </div>
            </div>
        );
    }
}

export default Editor;