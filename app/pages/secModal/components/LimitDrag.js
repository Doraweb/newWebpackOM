import Drag from './Drag';

function LimitDrag (id) {
	Drag.call(this,id); // 继承属性
}

for (var i in Drag.prototype) {
	LimitDrag.prototype[i] = Drag.prototype[i];
}

LimitDrag.prototype.fnMove = function (e) {
	var oEvent = e || event;
	var l = oEvent.clientX - this.disX;
	var t = oEvent.clientY - this.disY;

	if (l < -(document.documentElement.clientWidth - this.oDiv.offsetWidth) / 2  - this.oDiv.offsetWidth + 48) {
		l = -(document.documentElement.clientWidth - this.oDiv.offsetWidth) / 2 - this.oDiv.offsetWidth + 48;
	} else if (l > ((document.documentElement.clientWidth - this.oDiv.offsetWidth) / 2)) {
		l = ((document.documentElement.clientWidth - this.oDiv.offsetWidth) / 2);
	}	

	if (t < -(document.documentElement.clientHeight - this.oDiv.offsetHeight) / 2 + 32 + 56) {
		t = -(document.documentElement.clientHeight - this.oDiv.offsetHeight) / 2 + 32 + 56;
	} else if (t > (document.documentElement.clientHeight - this.oDiv.offsetHeight) / 2 + this.oDiv.offsetHeight - 50) {
		t = (document.documentElement.clientHeight - this.oDiv.offsetHeight) / 2 + this.oDiv.offsetHeight - 50;
	}

	this.oDiv.style.left = l + 'px';
	this.oDiv.style.top = t + 'px';
	
}

export default LimitDrag;