/**
 * 
 * 
 * @options
 * container必填，指定瀑布流容器的 selector
 * pins必填，指定瀑布流添加的区块的 selector
 * loader必填，指定瀑布流加载时的 loading 的 selector
 * gapHeight默认值为 20，pins 上下间隔的距离
 * gapWidth默认值为 20，pins 左右间隔的距离
 * pinWidth默认值为 216，pins 的宽度为 216px
 * threshold默认值为 100，当距离底部还是有 100px 的时候就开始加载
 *  
 * 
 */



var root = (typeof self == 'object' && self.self == self && self) ||
    (typeof global == 'object' && global.global == global && global) ||
    this || {};

// 修复 bind 函数
Function.prototype.bind = Function.prototype.bind || function (context) {

    if (typeof this !== "function") {
        throw new Error("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var self = this;
    var args = Array.prototype.slice.call(arguments, 1);

    var fNOP = function () {};

    var fBound = function () {
        var bindArgs = Array.prototype.slice.call(arguments);
        self.apply(this instanceof fNOP ? this : context, args.concat(bindArgs));
    }

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
    return fBound;
}

var util = {
    extend: function (target) {
        for (var i = 1, len = arguments.length; i < len; i++) {
            for (var prop in arguments[i]) {
                if (arguments[i].hasOwnProperty(prop)) {
                    target[prop] = arguments[i][prop]
                }
            }
        }

        return target
    },
    isValidListener: function (listener) {
        if (typeof listener === 'function') {
            return true
        } else if (listener && typeof listener === 'object') {
            return isValidListener(listener.listener)
        } else {
            return false
        }
    },
    indexOf: function (array, item) {
        if (array.indexOf) {
            return array.indexOf(item);
        } else {
            var result = -1;
            for (var i = 0, len = array.length; i < len; i++) {
                if (array[i] === item) {
                    result = i;
                    break;
                }
            }
            return result;
        }
    },

    getStyle:function(element, att){
        //特性侦测
        if(window.getComputedStyle){
            //优先使用W3C规范
            return window.getComputedStyle(element)[att];
        }else{
            //针对IE9以下兼容
            return element.currentStyle[att];
        }
    }
};

function EventEmitter() {
    this.__events = {}
}

EventEmitter.prototype.on = function (eventName, listener) {
    if (!eventName || !listener) return;

    if (!util.isValidListener(listener)) {
        throw new TypeError('listener must be a function');
    }

    var events = this.__events;
    var listeners = events[eventName] = events[eventName] || [];
    var listenerIsWrapped = typeof listener === 'object';

    // 不重复添加事件
    if (util.indexOf(listeners, listener) === -1) {
        listeners.push(listenerIsWrapped ? listener : {
            listener: listener,
            once: false
        });
    }

    return this;
};

EventEmitter.prototype.once = function (eventName, listener) {
    return this.on(eventName, {
        listener: listener,
        once: true
    })
};

EventEmitter.prototype.off = function (eventName, listener) {
    var listeners = this.__events[eventName];
    if (!listeners) return;

    var index;
    for (var i = 0, len = listeners.length; i < len; i++) {
        if (listeners[i] && listeners[i].listener === listener) {
            index = i;
            break;
        }
    }

    if (typeof index !== 'undefined') {
        listeners.splice(index, 1, null)
    }

    return this;
};

EventEmitter.prototype.emit = function (eventName, args) {
    var listeners = this.__events[eventName];
    if (!listeners) return;

    for (var i = 0; i < listeners.length; i++) {
        var listener = listeners[i];
        if (listener) {
            listener.listener.apply(this, args || []);
            if (listener.once) {
                this.off(eventName, listener.listener)
            }
        }

    }

    return this;

};

// 惰性函数 addEvent
var addEvent = (function () {
    if (window.addEventListener) {
        return function (elem, type, fn) {
            elem.addEventListener(type, fn, false);
        }
    } else if (window.attachEvent) {
        return function (elem, type, fn) {
            elem.attachEvent('on' + type, fn);
        }
    }
})();

function WaterFall(opts) {

    EventEmitter.call(this);

    this.opts = util.extend({}, this.constructor.defaultopts, opts);

    this._container = typeof this.opts.container === 'string' ? document.querySelector(this.opts.container) : this.opts.container;
    this._pins = typeof this.opts.pins === 'string' ? document.querySelectorAll(this.opts.pins) : this.opts.pins;
    this._loader = typeof this.opts.loader === 'string' ? document.querySelector(this.opts.loader) : this.opts.loader;

    this.init();
}

WaterFall.VERSION = '1.0.0';

WaterFall.defaultopts = {
    gapHeight: 20,
    gapWidth: 20,
    pinWidth: 216,
    threshold: 100
}

var proto = WaterFall.prototype = new EventEmitter();

proto.constructor = WaterFall;

proto.init = function () {

    // 计算有多少列
    this.getColumnNum();
    // 设置 container 居中
    // this.setContainer();

    // 如果已经有图片，设置为瀑布流
    if (this._pins.length > 0) {
        this.setPosition(this._pins)
    }

    var self = this;
    // 设置瀑布流
    setTimeout(function () {
        self.setWaterFall();
    }, 0)
    // 绑定滚动事件
    this.bindScrollEvent();

};

proto.getColumnNum = function () {
    this._unitWidth = this.opts.pinWidth + this.opts.gapWidth;

    this._viewPortWidth = this._container.clientWidth || window.innerWidth || document.documentElement.clientWidth;
    this._viewPortHeight = window.innerHeight || document.documentElement.clientHeight;

    this._num = Math.floor((this._viewPortWidth + this.opts.gapWidth) / this._unitWidth);

    // 用于储存每列的高度，起始都为 0
    this._columnHeightArr = [];
    for (var i = 0; i < this._num; i++) {
        this._columnHeightArr[i] = 0;;
    }
};

/**
 * 计算并且设置 container 宽度，使其居中
 */
// proto.setContainer = function () {
//     this._container.style.width = (this._unitWidth * this._num - this.opts.gapWidth) + 'px';
// };

/**
 * 获取高度数组中的最小值，用于确定下个 pin 插入到那一列中
 */
proto.getMin = function () {
    return Math.min.apply(null, this._columnHeightArr);
};

/**
 * 获取高度数组中的最大值，用于设置 loading 的 top 值
 */
proto.getMax = function () {
    return Math.max.apply(null, this._columnHeightArr);
};

// 保证一次只进行一次加载
var load = false;

proto.appendPins = function () {
    if (load) return;

    load = true;

    // 显示 loading
    if (this._loader) {
        this._loader.style.display = 'block';
    }

    // 保证短时间内只触发一次
    this.emit("load");
};

proto.append = function (data) {
    if(Object.prototype.toString.call(data) !== '[object Array]') return;
    this._newPins = [];
    var self = this;
    var htmlStr = [];
    data.forEach(function(item,index){
        var scale = item.w / item.h;
        var html = '<div class="pin" style="width:'+self.opts.pinWidth+'px;height:'+self.opts.pinWidth / scale+'px"><img class="img" src="/img/loading.gif" data-lazy-src="'+item.src+'"></div>'
        htmlStr.push(html)
    })
    var div = document.createElement("div")
    div.innerHTML = htmlStr.join('');
    var children = div.querySelectorAll(this.opts.pins)
    var fragment = document.createDocumentFragment();

    for (var j = 0, len = children.length; j < len; j++) {
        fragment.appendChild(children[j])
        this._newPins.push(children[j])
    }
    
    this._container.appendChild(fragment);
    this.setPosition(this._newPins);    
    this._container.style.minHeight = (this.getMax() + 20) + 'px';
    
    // 可以加载新的数据
    load = false;
    // 隐藏 loading
    if (this._loader) {
        this._loader.style.display = 'none';
    }
};

/**
 * 设置新的 pins 的位置
 */
proto.setPosition = function (pins) {

    for (var i = 0, len = pins.length; i < len; i++) {
        var min = this.getMin();
        var index = util.indexOf(this._columnHeightArr, min);

        pins[i].style.left = this._unitWidth * index + 'px';

        pins[i].style.top = min + 'px';
        this._columnHeightArr[index] += (pins[i].offsetHeight + this.opts.gapHeight);
    }

    this._newPins = [];
    this.setWaterFall()

};

/**
 * 判断是否需要添加新的 pins，在 init 的时候会调用一次，保证首屏充满
 */
proto.setWaterFall = function () {
    if (this.getMin() < this._viewPortHeight) {
        this.appendPins();
    }
};

proto.bindScrollEvent = function () {
    addEvent(window, "scroll", this.handleScroll.bind(this));
    addEvent(window, "resize", this.handleResize.bind(this))
};

var timer = null;

proto.handleResize = function () {
    var self = this;
    clearTimeout(timer);
    timer = setTimeout(function () {
        // self.resetPosition()
    }, 100)
};

proto.resetPosition = function () {
    // 计算有多少列
    this.getColumnNum();
    // 设置 container 居中
    this.setContainer();
    // 设置瀑布流
    this.setPosition(typeof this.opts.pins === 'string' ? document.querySelectorAll(this.opts.pins) : this.opts.pins);
};

/**
 * 只要有空白处，就可以加载新的数据
 */
proto.checkScroll = function () {
    if (this.getMin() - (window.pageYOffset || document.documentElement.scrollTop) < this._viewPortHeight + this.opts.threshold) {
        return true
    }
    return false;
};

proto.handleScroll = function () {

    var self = this;
    if (self.checkScroll()) {
        self.appendPins();
    }
};

proto.destroy = function(){
    var self = this;
    while (self._container.firstChild) {
        self._container.removeChild(self._container.firstChild);
    }
    self._container.style = '';
    self._loader.style = '';
}
export default WaterFall;