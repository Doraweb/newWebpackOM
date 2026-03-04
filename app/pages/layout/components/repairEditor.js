import React, { Component } from 'react';
import E from 'wangeditor'
import S from './SeachEditor'
import http from '../../../common/http'
import appConfig from '../../../common/appConfig'

class repairEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editorContent:''
         };
        this.over = this.over.bind(this);
        this.out = this.out.bind(this);
    }
    componentDidMount() {
        const {content} = this.props
        const elemBody = this.refs.editorElemBody3;
        const editor = new E('',elemBody)
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
        editor.create()
        editor.txt.html(content)
        editor.$textElem.attr('contenteditable', false)
    };
    //内层移入,外层滚动条消失
    over(e){
        event.stopPropagation()
        event.preventDefault()
        let id = document.getElementById('repairManagement')
        id.style.overflowY ='hidden'
    }
    //鼠标移出，外层股东条显示
    out(){
        event.stopPropagation()
        event.preventDefault()
        let id = document.getElementById('repairManagement')
        id.style.overflowY ='scroll'
    }
    render() {
        return (
            <div className="wangEdit" style={{width:'98%'}}>
                <div className='repairEditor'>
                    <div ref="editorElemMenu3"
                         style={{border:"1px solid #ccc"}}
                    >
                    </div>
                    <div
                        style={{
                            padding:"0 10px",
                            height:150,
                            border:"1px solid #ccc",
                            borderTop:"none"
                        }}
                        onMouseOver={this.over}
                        onMouseOut ={this.out}
                        ref="editorElemBody3">
                    </div>
                </div>
            </div>
        );
    }
}

export default repairEditor;