import { app, BrowserWindow, Menu, ipcMain, crashReporter } from 'electron';
import { json } from 'express';
import commands from './core/commands';
// import { history } from './index';

//import { initialize } from './pages/layout/modules/LayoutModule';
//import { store } from './routes';
const electronWindow = require('electron-window')
require('@electron/remote/main').initialize()
// const webFrame = require('electron').webFrame
const fs = require('fs');
const log = require('electron-log')
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
let argv = process.argv;
const isDev = process.env.NODE_ENV === 'development';
const UNDEFINED = undefined;
let screenWidth = null;//屏幕宽
let screenHeight = null;//屏幕高
let screenRatio = 1;//屏幕比例
let appWindowWidth = 1920; //主窗口的宽
let appWindowHeight = 1080;//主窗口的高

// 登录窗口
let loginWin = null;
// 主窗口
let appWin = null;
let xAxis, yAxis;
if (argv.length == 13 || argv.length == 9) {
	if (argv[argv.length - 3] == 1) {
		xAxis = 0
		yAxis = 0
	} else if (argv[argv.length - 3] == 2) {
		xAxis = -1920
		yAxis = 0
	} else if (argv[argv.length - 3] == 3) {
		xAxis = -1920
		yAxis = -1080
	} else if (argv[argv.length - 3] == 4) {
		xAxis = 0
		yAxis = -1080
	} else if (argv[argv.length - 3] == 5) {
		xAxis = 1920
		yAxis = -1080
	} else if (argv[argv.length - 3] == 6) {
		xAxis = 1920
		yAxis = 0
	} else {
		xAxis = 0
		yAxis = 0
	}
} else {
	xAxis = 0
	yAxis = 0
}




app.commandLine.appendSwitch('js-flags', '--max-old-space-size=2048');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
//app.commandLine.appendSwitch('js-flags', '--disable-display-list-2d-canvas');
//app.commandLine.appendSwitch('js-flags', '--disable-accelerated-2d-canvas');

// 关闭硬件加速
//app.disableHardwareAcceleration();
// app.setPath('temp','C:/doraWork/code/OM/log')
crashReporter.start({
	autoSubmit: true,
	companyName: "inwhile",
	extra: { extra: "info from the main process" },
	ignoreSystemCrashHandler: true,
	submitURL: "https://pacific-falls-32011.herokuapp.com/",
	uploadToServer: false
});

if (!isDev) {
	const sourceMapSupport = require('source-map-support'); // eslint-disable-line
	sourceMapSupport.install();
}

if (isDev) {
	require('electron-debug')(); // eslint-disable-line global-require
	const path = require('path'); // eslint-disable-line
	const p = path.join(__dirname, '..', 'app', 'node_modules'); // eslint-disable-line
	require('module').globalPaths.push(p); // eslint-disable-line
}

// 添加扩展程序
const installExtensions = async () => {
	log.error("the install param {isDev}: " + isDev);
	if (isDev) {
		const installer = require('electron-devtools-installer'); // eslint-disable-line global-require

		const extensions = [
			// react 调试工具
			'REACT_DEVELOPER_TOOLS',
			// redux 调试工具
			'REDUX_DEVTOOLS'
		];

		const forceDownload = !!process.env.UPGRADE_EXTENSIONS;

		log.error("begin to download extensions!");
		return Promise
			.all(extensions.map(name => installer.default(installer[name], forceDownload)))
			.catch(console.log);
	}
};

// 添加右键调试菜单
const addDebugContextMenu = (destWindow) => {
	// if (isDev) {
	// 往右键菜单上添加调试按钮
	destWindow.webContents.on('context-menu', (e, props) => {
		Menu.buildFromTemplate([{
			label: '检查元素',
			click() {
				destWindow.inspectElement(props.x, props.y);
			}
		}]).popup(destWindow);
	});
	// }
}

// 所有窗口关闭后，结束程序
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});

Date.prototype.format = function (format) {
	var date = {
		"M+": this.getMonth() + 1,
		"d+": this.getDate(),
		"h+": this.getHours(),
		"m+": this.getMinutes(),
		"s+": this.getSeconds(),
		"q+": Math.floor((this.getMonth() + 3) / 3),
		"S+": this.getMilliseconds()
	};
	if (/(y+)/i.test(format)) {
		format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
	}
	for (var k in date) {
		if (new RegExp("(" + k + ")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length == 1
				? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
		}
	}
	return format;
}

app.on('ready', async () => {

	const { screen } = require('electron')

	// Create a window that fills the screen's available work area.
	const primaryDisplay = screen.getPrimaryDisplay()
	screenWidth = primaryDisplay.workAreaSize.width
	screenHeight = primaryDisplay.workAreaSize.height
	screenRatio = primaryDisplay.scaleFactor
	log.error("屏幕宽高比例" + screenWidth + screenHeight + screenRatio);

	// if (argv[argv.length - 4] == "-No" && argv[argv.length - 6] == "-count") {




	// log转换成文件初始化配置
	// Same as for console transport
	log.transports.file.level = 'warn';
	log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}:{ms}] {text}';

	// Set approximate maximum log size in bytes. When it exceeds,
	// the archived log will be saved as the log.old.log file
	log.transports.file.maxSize = 5 * 1024 * 1024;

	// Write to this file, must be set before first logging
	// log.transports.file.file = __dirname + '/dev-OMlog.txt';

	// fs.createWriteStream options, must be set before first logging
	// you can find more information at
	// https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options
	log.transports.file.streamConfig = { flags: 'w' };

	let newDate = new Date();

	let strLogFileName = newDate.format('yyyy-MM-dd-hh-mm-ss');
	let logPath = process.execPath.slice(0, -7).replace(/\\/g, '\/')
	strLogFileName = strLogFileName + '.txt';
	if (process.execPath.indexOf("OM.exe") != -1) {
		if (!fs.existsSync(logPath + '/log')) {
			fs.mkdirSync(logPath + '/log')
		}
		log.transports.file.stream = fs.createWriteStream(logPath + `/log/${strLogFileName}`);
	} else {
		if (!fs.existsSync('log')) {
			fs.mkdirSync('log')
		}
		log.transports.file.stream = fs.createWriteStream(`log/${strLogFileName}`);
	}

	log.error('app on ready');
	log.error('start to install extensions');

	if (argv.length > 14 && argv[argv.length - 6] == "-count") {
		let count = Number(argv[argv.length - 5])
		appWindowWidth = parseInt(screenWidth / Math.sqrt(count));
		appWindowHeight = parseInt(screenHeight / Math.sqrt(count));
		log.error("let count" + count);
		if (count == "4") {
			if (argv[argv.length - 3] == "1") {
				xAxis = 0;
				yAxis = 0;
			} else if (argv[argv.length - 3] == "2") {
				xAxis = appWindowWidth;
				yAxis = 0;
			} else if (argv[argv.length - 3] == "3") {
				xAxis = 0;
				yAxis = appWindowHeight;
			} else if (argv[argv.length - 3] == "4") {
				xAxis = appWindowWidth;
				yAxis = appWindowHeight;
			}
		} else {
			if (count == "9") {
				if (argv[argv.length - 3] == "1") {
					xAxis = 0;
					yAxis = 0;
				} else if (argv[argv.length - 3] == "2") {
					xAxis = appWindowWidth;
					yAxis = 0;
				} else if (argv[argv.length - 3] == "3") {
					xAxis = parseInt(appWindowWidth * 2);
					yAxis = 0;
				} else if (argv[argv.length - 3] == "4") {
					xAxis = 0;
					yAxis = appWindowHeight;
				} else if (argv[argv.length - 3] == "5") {
					xAxis = appWindowWidth;
					yAxis = appWindowHeight;
				} else if (argv[argv.length - 3] == "6") {
					xAxis = parseInt(appWindowWidth * 2);
					yAxis = appWindowHeight;
				} else if (argv[argv.length - 3] == "7") {
					xAxis = 0;
					yAxis = parseInt(appWindowHeight * 2);
				} else if (argv[argv.length - 3] == "8") {
					xAxis = appWindowWidth;
					yAxis = parseInt(appWindowHeight * 2);
				} else if (argv[argv.length - 3] == "9") {
					xAxis = parseInt(appWindowWidth * 2);
					yAxis = parseInt(appWindowHeight * 2);
				}
			}
		}


		log.error('x' + xAxis);
		log.error('y' + yAxis);


	} else {
		appWindowWidth = parseInt(screenWidth / 2);
		appWindowHeight = parseInt(screenHeight / 2);
	}
	log.error('argv.length' + argv.length)
	log.error('x' + xAxis);
	log.error('y' + yAxis);
	log.error('appWindowWidth--' + appWindowWidth);
	log.error('appWindowHeight--' + appWindowHeight);
	log.error('count' + Number(argv[argv.length - 5]))
	log.error('count' + typeof (argv[argv.length - 5]))
	log.error('count' + argv[argv.length - 5])
	log.error('No' + argv[argv.length - 3])


	let sd = new Date().getTime();
	await installExtensions();
	let ed = new Date().getTime();
	log.error('start to install extensions,total cost: ' + (ed - sd));
	// 创建登录页面
	log.error('createLoginWindow finish');
	createLoginWindow();
});



const destroyWindow = (win) => {

	log.error('destroyWindow');
	if (!win || win.isDestroyed()) {
		return;
	}
	try {
		log.error('win close start')
		win.close();
		log.error('win close finish')
	} catch (e) {
		console.error(e);
		log.error(e)
	}
}

const createLoginWindow = () => {
	log.error('createLoginWindow start act');
	if (loginWin && !loginWin.isDestroyed()) {
		return loginWin;
	}

	log.error('electronWindow.createWindow start');

	loginWin = electronWindow.createWindow({
		frame: false,
		backgroundColor: '#121924',
		fullscreen: true,
		x: xAxis,
		y: yAxis,
		movable: true,
		resizable: true,
		minimizable: true,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			backgroundThrottling: false,
			enableRemoteModule: true
		}
	});
	//当是一键进入时，隐藏登录窗口
	if (argv.length > 14 && argv[argv.length - 6] == "-count") {
		loginWin.hide();
	}
	log.error('electronWindow.createWindow finish');

	log.error('addDebugContextMenu start');
	addDebugContextMenu(loginWin);
	log.error('addDebugContextMenu finish');

	log.error('loginWin.showUrl to login.html start');
	loginWin.showUrl(`${__dirname}/wins/login/login.html`, () => {

		log.error('loginWin.showUrl internal act...');
		loginWin.focus();
	});

	log.error('loginWin.showUrl to login.html finish');
}

const createAppWindow = () => {

	if (appWin && !appWin.isDestroyed()) {
		return appWin;
	}
	log.error('electronWindow.createWindow start');
	if (argv.length > 14 && argv[argv.length - 6] == "-count") {
		//设置了快捷登录分屏信息，直接显示设置好的主窗口
		appWin = electronWindow.createWindow({
			backgroundColor: '#121924',
			frame: false,
			width: parseInt(appWindowWidth),
			height: parseInt(appWindowHeight),
			x: xAxis,
			y: yAxis,
			webPreferences: {
				nodeIntegration: true,
				contextIsolation: false,
				backgroundThrottling: false,
				enableRemoteModule: true
			}
		});
		log.error('screen fenping');
		log.error('width' + parseInt(appWindowWidth));
		log.error('height' + parseInt(appWindowHeight));
		log.error('x' + xAxis);
		log.error('y' + yAxis);
		log.error(argv);
	} else {
		//没有设置的，默认全屏显示主窗口
		appWin = electronWindow.createWindow({
			backgroundColor: '#121924',
			frame: false,
			fullscreen: true,
			x: xAxis,
			y: yAxis,
			webPreferences: {
				nodeIntegration: true,
				contextIsolation: false,
				backgroundThrottling: false,
				enableRemoteModule: true
			}
		});
	}


	log.error('electronWindow.createWindow finish');

	appWin.webContents.on('crashed', (event) => {
		log.error('渲染进程崩溃事件：', event);
		log.error('appWin.webContents.on crashed');
		log.error('崩溃即将销毁');
		log.error('销毁前crashed');
		appWin.destroy();
	});

	log.error('appWin.maximize');
	isDev && appWin.maximize();

	log.error('addDebugContextMenu to appWin');
	addDebugContextMenu(appWin);

	log.error('appWin.showUrl to app.html start');

	appWin.showUrl(`${__dirname}/app.html`, () => {

		log.error('appWin.showUrl internal: Start rendering');

		appWin.focus();

		log.error('appWin.showUrl to app.html finish');
	});

	// appWin.webContents.on('did-finish-load', () => {
	//   app.on('before-quit',function(e){
	//       willQuitApp = false
	//       console.log('检测到准备退出事件')
	//       console.log('准备向渲染进程发送信息')
	//       appWin.webContents.send('send-from-main', e)
	//   })
	// })

	// // close 生命周期
	// appWin.on('close', (e) => {
	//   if(!willQuitApp){
	//     e.preventDefault()
	//   }
	//   // 监听关闭窗口的指令
	//   ipcMain.on('send-from-render',(event,value)=>{
	//     willQuitApp = value
	//     if(willQuitApp){
	//       console.log('即将将销毁窗口')
	//       // 目前只找查询到如何获取渲染进程的接口
	//       // process.kill(appWin.webContents.getOSProcessId())
	//       app.exit()
	//       // appWin = null
	//       // console.log(appWin)
	//     }else{
	//       console.log("窗口没有被关闭："+willQuitApp)
	//     }
	//   })
	// });

	// var forceQuit = false
	// app.on('before-quit',function(){
	//   forceQuit = true
	// })

	// windows中的close事件會比'before-quit'事件更先触发
	electronWindow.windows[appWin.id].on('close', function (event) {
		// if(forceQuit){
		event.preventDefault();
		appWin.webContents.send('open-confirm-modal', '确认模态框')

		// 接受渲染进程的异步信息
		ipcMain.on('open-or-close', (event, value) => {
			if (value) {
				app.exit()
			}
		})
		// }
	})



}

const initIPC = () => {

	log.error('initIPC start');
	ipcMain.on(commands.CLOSE_LOGIN_WINDOW, (event, args) => {
		destroyWindow(loginWin);

	});

	ipcMain.on(commands.AFTER_LOGIN_SUCCESS, (event, args) => {

		log.error('loginWin.hide start');
		//点击登录按钮时，会弹出报错窗口，显示Object has been destroyed,所以取消hide方法测试
		//loginWin.hide();
		log.error('loginWin.hide finish');

		log.error('createAppWindow start');
		createAppWindow();
		log.error('createAppWindow finish');

		log.error('loginWin start');
		destroyWindow(loginWin);
		log.error('loginWin finish');
	});

	ipcMain.on('show-context-memu-fix-create', (event) => {
		const template = [
			{
				label: '新建备注',
				click: () => { event.sender.send('context-menu-command-fix-create', '新建备注') }
			}
		]
		const menu = Menu.buildFromTemplate(template)
		menu.popup(BrowserWindow.fromWebContents(event.sender))
	})

	ipcMain.on('show-context-memu-fix', (event, id) => {
		const template = [
			{
				label: '修改备注',
				click: () => { event.sender.send('context-menu-command-fix-modify', '修改备注', id) }
			},
			{
				label: '删除备注',
				click: () => { event.sender.send('context-menu-command-fix-remove', '删除备注', id) }
			}
		]
		const menu = Menu.buildFromTemplate(template)
		menu.popup(BrowserWindow.fromWebContents(event.sender))
	})

	ipcMain.on(commands.CLOSE_APP_WINDOW, (event, args) => {
		log.error('ipcMain.on commands.CLOSE_APP_WINDOW');
		// destroyWindow(appWin);
		app.exit() //直接退出程序，不会再进入close事件中
	});

	ipcMain.on(commands.MINIMIZE_APP_WINDOW, (event, args) => {
		log.error('ipcMain.on commands.MINIMIZE_APP_WINDOW');
		appWin.minimize();
	});
	ipcMain.on(commands.RELOAD_APP_WINDOW, (event, args) => {
		log.error('ipcMain.on commands.RELOAD_APP_WINDOW');
		appWin.webContents.reload();
	});


	ipcMain.on('show-om-remind', (event) => {
		appWin.flashFrame(true);
	})

	ipcMain.on('stop-om-remind', (event) => {
		appWin.flashFrame(false);
	})

	//最大化或恢复
	ipcMain.on(commands.MAXIMIZE_APP_WINDOW, (event, args) => {
		// if (appWin.getSize()[0] == screenWidth) {
		// 	log.error('ipcMain.on commands.MAXIMIZE_APP_WINDOW-当前最大-恢复变小');
		// 	appWin.setFullScreen(false);
		// 	appWin.setContentSize(appWindowWidth, appWindowHeight);
		// 	appWin.setPosition(xAxis, yAxis);
		// 	appWin.webContents.reload();
		// 	log.error('ipcMain.on commands.MAXIMIZE_APP_WINDOW' + appWindowWidth + appWindowHeight + xAxis + yAxis);
		// }else {
		log.error('ipcMain.on commands.MAXIMIZE_APP_WINDOW-执行最大化');
		appWin.setFullScreen(true);
		appWin.webContents.reload();
		// }
		log.error('当前宽' + appWin.getSize()[0])
		log.error('当前高' + appWin.getSize()[1])
		log.error('屏幕宽' + screenWidth)
		log.error('屏幕高' + screenHeight)
	});
	//分屏定位显示
	ipcMain.on(commands.SPLIT_APP_WINDOW, (event, args) => {
		if (args.numId == '0') {
			//如果宽度不改变，则不会刷新窗口
			if (appWin.getSize()[0] != screenWidth) {
				appWin.setFullScreen(true);
				appWin.webContents.reload();
			} else {
				appWin.setFullScreen(true);
			}
			log.error('args' + args)
			log.error('type-args' + typeof (args))
		} else {
			appWindowWidth = screenWidth / 2;
			appWindowHeight = screenHeight / 2;
			if (args.numId == '1') {
				xAxis = 0;
				yAxis = 0;
			} else if (args.numId == '2') {
				xAxis = appWindowWidth;
				yAxis = 0;
			} else if (args.numId == '3') {
				xAxis = 0;
				yAxis = appWindowHeight;
			} else if (args.numId == '4') {
				xAxis = appWindowWidth;
				yAxis = appWindowHeight;
			}

			//如果宽度不改变，则不会刷新窗口
			if (appWin.getSize()[0] != appWindowWidth) {
				appWin.setFullScreen(false);
				appWin.setContentSize(appWindowWidth, appWindowHeight);
				appWin.setPosition(xAxis, yAxis);
				appWin.webContents.reload();
			} else {
				appWin.setFullScreen(false);
				appWin.setContentSize(appWindowWidth, appWindowHeight);
				appWin.setPosition(xAxis, yAxis);
			}
			log.error('args' + args)
			log.error('type-args' + typeof (args))
		}

		log.error('ipcMain.on commands.SPLIT_APP_WINDOW' + appWindowWidth + appWindowHeight + xAxis + yAxis);
		log.error(args)
	});

	ipcMain.on('add-operation-error', (event, data) => {
		log.error(data)
	})

	ipcMain.on('get-userData-path', (event, id) => {
		const userDataPath = app.getPath('userData')
		event.sender.send('response-userData-path', userDataPath)
		log.error(`userDataPath${userDataPath}`);
	})
};

initIPC()










