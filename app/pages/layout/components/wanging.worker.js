let interval = 10000;
let intervalHealth = 50000;
let intervalFault = 60000;
let intervalStandby = 30000;
let id = undefined;
let projectId = undefined;
let pointList;
let serverUrl = '';
let user = '';
let language = 'zh'; // 默认中文

//网络拓扑、报警页面信息等
function requestWarningData() {
    if (serverUrl && serverUrl.slice(-4) != '5000') {
        interval = 60000
    }
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.status == 200) {
            try {
                postMessage(JSON.parse(xhr.responseText));
            } catch (err) {
                postMessage({ error: "1000" });
            }
            setTimeout(requestWarningData, interval);
        } else {
            postMessage({ error: '1000' })
            setTimeout(requestWarningData, interval);
        }
    }
    // 加载失败
    xhr.onerror = function () {
        postMessage({ interfaceStatus: true })
        setTimeout(requestWarningData, interval);
    }
    //加载超时
    xhr.ontimeout = function () {
        postMessage({ interfaceStatus: true })
        setTimeout(requestWarningData, interval);
    }

    //请求被中止
    xhr.onabort = function () {
        setTimeout(requestWarningData, interval);
    }

    xhr.open("POST", serverUrl + "/warning/getRealtime");
    xhr.setRequestHeader("Content-Type", "application/json");
    //传参获取报警页面id
    xhr.send(JSON.stringify({ getPageWarning: true, lan: language }));
}

function requestHealthData() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.status == 200) {
            postMessage(JSON.parse(xhr.responseText))
            setTimeout(requestHealthData, intervalHealth)
        } else {
            postMessage({ error: '1000' })
        }
    }
    // 加载失败
    xhr.onerror = function () {
        postMessage({ interfaceStatus: true })
        setTimeout(requestHealthData, intervalHealth);
    }
    //加载超时
    xhr.ontimeout = function () {
        postMessage({ interfaceStatus: true })
        setTimeout(requestHealthData, intervalHealth);
    }

    xhr.open("POST", serverUrl + "/system/getHealth");
    xhr.setRequestHeader("Content-Type", "application/json");
    // 根据语言设置添加参数
    const requestData = language === 'en' ? { lan: 'en' } : {};
    xhr.send(JSON.stringify(requestData));
}

function requestFaultData() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.status == 200) {
            postMessage(JSON.parse(xhr.responseText))
            setTimeout(requestFaultData, intervalFault)
        } else {
            postMessage({ error: '1000' })
            setTimeout(requestFaultData, intervalFault)
        }
    }
    // 加载失败
    xhr.onerror = function () {
        postMessage({ interfaceStatus: true })
        setTimeout(requestFaultData, intervalFault);
    }
    //加载超时
    xhr.ontimeout = function () {
        postMessage({ interfaceStatus: true })
        setTimeout(requestFaultData, intervalFault);
    }

    xhr.open("POST", serverUrl + "/fdd/getWorkOrderUpdate");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({ userName: user }));
}
//单独获取实时报警信息（近四小时）  远程默认30秒（可自定—），本地10秒
function requestOnlyWarningData() {
    if (serverUrl && serverUrl.slice(-4) != '5000') {
        interval = realtimeDataIntervalRemote * 1000
    }
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.status == 200) {
            try {
                postMessage(JSON.parse(xhr.responseText));
            } catch (err) {
                postMessage({ error: "1000" });
            }
            setTimeout(requestOnlyWarningData, interval);
        } else {
            postMessage({ error: '1000' })
            setTimeout(requestOnlyWarningData, interval);
        }
    }
    // 加载失败
    xhr.onerror = function () {
        postMessage({ interfaceStatus: true })
        setTimeout(requestOnlyWarningData, interval);
    }
    //加载超时
    xhr.ontimeout = function () {
        postMessage({ interfaceStatus: true })
        setTimeout(requestOnlyWarningData, interval);
    }

    //请求被中止
    xhr.onabort = function () {
        setTimeout(requestOnlyWarningData, interval);
    }

    xhr.open("POST", serverUrl + "/warning/getRealtime");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({ seconds: 14400, lan: language }));
}

//30秒，获取备机的dom系统运行状态
function requestDomActiveStatus() {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        if (xhr.status == 200) {
            try {
                postMessage(JSON.parse(xhr.responseText));
            } catch (err) {
                postMessage({ error: "1000" });
            }
            setTimeout(requestDomActiveStatus, intervalStandby);
        } else {
            postMessage({ error: '1000' })
            setTimeout(requestDomActiveStatus, intervalStandby);
        }
    }
    // 加载失败
    xhr.onerror = () => {
        postMessage({ interfaceStatus: true })
        setTimeout(requestDomActiveStatus, intervalStandby);
    }
    //加载超时
    xhr.ontimeout = () => {
        postMessage({ interfaceStatus: true })
        setTimeout(requestDomActiveStatus, intervalStandby);
    }

    //请求被中止
    xhr.onabort = () => {
        setTimeout(requestDomActiveStatus, intervalStandby);
    }

    xhr.open("GET", `http://${slaveUrl}:5000/getDomActiveStatus`);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(null);
}

function messageHandler(e) {
    var type = e.data.type;
    switch (type) {
        case 'realWarning':
            serverUrl = e.data.serverUrl;
            language = e.data.language || 'zh'
            requestWarningData()
            break;
        case 'realHealth':
            serverUrl = e.data.serverUrl;
            language = e.data.language || 'zh'; // 接收语言参数
            requestHealthData()
            break;
        case 'realFault':
            user = e.data.user;
            serverUrl = e.data.serverUrl;
            requestFaultData()
            break;
        case 'warningData':
            realtimeDataIntervalRemote = e.data.realtimeDataIntervalRemote;
            serverUrl = e.data.serverUrl;
            language = e.data.language || 'zh'
            requestOnlyWarningData()
            break;
        case 'standbyData':
            slaveUrl = e.data.slaveUrl;
            requestDomActiveStatus()
            break;
    }
}
addEventListener("message", messageHandler, true);