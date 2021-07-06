let colours = new Array("#a6f", "#60f", "#60f", "#a6f", "#ccc");
let bubbles = 66;
let over_or_under = "over";
let x = ox = 400;
let y = oy = 300;
let swide = 800;
let shigh = 600;
let sleft = sdown = 0;
let bubb = new Array();
let bubbx = new Array();
let bubby = new Array();
let bubbs = new Array();
let sploosh = false;

function addLoadEvent(funky) {
	window.scrollTo({top: 1, left: 0, behavior: 'auto'});
	let oldonload = window.onload;
	if (typeof (oldonload) != 'function') window.onload = funky;
	else window.onload = function () {
		if (oldonload) oldonload();
		funky();
	}
}

addLoadEvent(buble);

function buble() {
	if (document.getElementById) {
		let i, rats, div;
		for (i = 0; i < bubbles; i++) {
			rats = createDiv("3px", "3px");
			rats.style.visibility = "hidden";
			rats.style.zIndex = (over_or_under == "over") ? "1001" : "0";

			div = createDiv("auto", "auto");
			rats.appendChild(div);
			div = div.style;
			div.top = "1px";
			div.left = "0px";
			div.bottom = "1px";
			div.right = "0px";
			div.borderLeft = "1px solid " + colours[3];
			div.borderRight = "1px solid " + colours[1];

			div = createDiv("auto", "auto");
			rats.appendChild(div);
			div = div.style;
			div.top = "0px";
			div.left = "1px";
			div.right = "1px";
			div.bottom = "0px"
			div.borderTop = "1px solid " + colours[0];
			div.borderBottom = "1px solid " + colours[2];

			div = createDiv("auto", "auto");
			rats.appendChild(div);
			div = div.style;
			div.left = "1px";
			div.right = "1px";
			div.bottom = "1px";
			div.top = "1px";
			div.backgroundColor = colours[4];
			if (navigator.appName == "Microsoft Internet Explorer") div.filter = "alpha(opacity=50)";
			else div.opacity = 0.5;
			document.body.appendChild(rats);
			bubb[i] = rats.style;
		}
		set_scroll();
		set_width();
		bubble();
	}
}

function bubble() {
	let c;
	if (Math.abs(x - ox) > 1 || Math.abs(y - oy) > 1) {
		ox = x;
		oy = y;
		for (c = 0; c < bubbles; c++) if (!bubby[c]) {
			bubb[c].left = (bubbx[c] = x) + "px";
			bubb[c].top = (bubby[c] = y - 3) + "px";
			bubb[c].width = "3px";
			bubb[c].height = "3px"
			bubb[c].visibility = "visible";
			bubbs[c] = 3;
			break;
		}
	}
	for (c = 0; c < bubbles; c++) if (bubby[c]) update_bubb(c);
	setTimeout("bubble()", 40);
}

document.onmousedown = splash;
document.onmouseup = function () {
	clearTimeout(sploosh);
};

function splash() {
	ox = -1;
	oy = -1;
	sploosh = setTimeout('splash()', 100);
}

function update_bubb(i) {
	if (bubby[i]) {
		bubby[i] -= bubbs[i] / 2 + i % 2;
		bubbx[i] += (i % 5 - 2) / 5;
		if (bubby[i] > sdown && bubbx[i] > sleft && bubbx[i] < sleft + swide + bubbs[i]) {
			if (Math.random() < bubbs[i] / shigh * 2 && bubbs[i]++ < 8) {
				bubb[i].width = bubbs[i] + "px";
				bubb[i].height = bubbs[i] + "px";
			}
			bubb[i].top = bubby[i] + "px";
			bubb[i].left = bubbx[i] + "px";
		} else {
			bubb[i].visibility = "hidden";
			bubby[i] = 0;
			return;
		}
	}
}

document.onmousemove = mouse;

function mouse(e) {
	if (e) {
		y = e.pageY;
		x = e.pageX;
	} else {
		set_scroll();
		y = event.y + sdown;
		x = event.x + sleft;
	}
}

window.onresize = set_width;

function set_width() {
	let sw_min = 999999;
	let sh_min = 999999;
	if (document.documentElement && document.documentElement.clientWidth) {
		if (document.documentElement.clientWidth > 0) sw_min = document.documentElement.clientWidth;
		if (document.documentElement.clientHeight > 0) sh_min = document.documentElement.clientHeight;
	}
	if (typeof (self.innerWidth) == 'number' && self.innerWidth) {
		if (self.innerWidth > 0 && self.innerWidth < sw_min) sw_min = self.innerWidth;
		if (self.innerHeight > 0 && self.innerHeight < sh_min) sh_min = self.innerHeight;
	}
	if (document.body.clientWidth) {
		if (document.body.clientWidth > 0 && document.body.clientWidth < sw_min) sw_min = document.body.clientWidth;
		if (document.body.clientHeight > 0 && document.body.clientHeight < sh_min) sh_min = document.body.clientHeight;
	}
	if (sw_min == 999999 || sh_min == 999999) {
		sw_min = 800;
		sh_min = 600;
	}
	swide = sw_min;
	shigh = sh_min;
}

window.onscroll = set_scroll;

function set_scroll() {
	if (typeof (self.pageYOffset) == 'number') {
		sdown = self.pageYOffset;
		sleft = self.pageXOffset;
	} else if (document.body && (document.body.scrollTop || document.body.scrollLeft)) {
		sdown = document.body.scrollTop;
		sleft = document.body.scrollLeft;
	} else if (document.documentElement && (document.documentElement.scrollTop || document.documentElement.scrollLeft)) {
		sleft = document.documentElement.scrollLeft;
		sdown = document.documentElement.scrollTop;
	} else {
		sdown = 0;
		sleft = 0;
	}
}

function createDiv(height, width) {
	let div = document.createElement("div");
	div.style.position = "absolute";
	div.style.height = height;
	div.style.width = width;
	div.style.overflow = "hidden";
	div.style.backgroundColor = "transparent";
	return (div);
}
