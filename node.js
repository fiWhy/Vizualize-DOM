var VirtualNode = (function () {
    function VirtualNode(el) {
        this.tag = el.tagName;
        this.nodeName = el.nodeName;
        this.originalNode = el;
        this.children = [];
        this.classList = el.className ? el.className.split(' ') : [];
        this.contentElement = null;
        this.blockElement = null;
        this.nodeType = el.nodeType;
        this.content = this.registerContent(el);
    }

    VirtualNode.prototype.concatChildren = function (children) {
        this.children = this.children.concat(children);
    }

    VirtualNode.prototype.registerContent = function (el) {
        return el.nodeType === Node.TEXT_NODE &&
            el.tagName !== 'SCRIPT' ? el.nodeValue.trim() || '' : '';
    }

    VirtualNode.appendStyles = function (styleObj, el) {
        for (var i in styleObj) {
            if (styleObj.hasOwnProperty(i)) {
                el.style[i] = styleObj[i];
            }
        }
    }

    VirtualNode.appendClasses = function (classList, el) {
        classList.forEach(function (className) {
            el.classList.add(className);
        });
    };

    return VirtualNode;
}())

var Virtual = (function (VirtualNode) {
    var colors = {};
    colors[Node.ELEMENT_NODE] = '#60a2ff';
    colors[Node.TEXT_NODE] = '#ff9a2e';
    colors[Node.COMMENT_NODE] = '#3d9929';

    function virtualize(el) {
        var vArr = [];
        el.childNodes.forEach(function (child) {
            var virtualEl = new VirtualNode(child);
            virtualEl.concatChildren(virtualize(child));
            vArr.push(virtualEl);
        });
        return vArr;
    }

    function vizualize(el) {
        var virtualized = virtualize(el);
        var rendered = render(virtualized);
        return rendered;
    }

    function render(virtualizedDOM, holder, level) {
        var holder = holder || document.createElement('div');
        var level = level || 0;
        var marginLeft = level * 15;
        virtualizedDOM.forEach(function (el) {
            el.blockElement = document.createElement('div');
            el.contentElement = document.createElement('div');

            VirtualNode.appendClasses(['holder'], el.blockElement);
            VirtualNode.appendStyles({
                marginLeft: marginLeft + 'px'
            }, el.blockElement);
            VirtualNode.appendStyles({
                backgroundColor: colors[el.nodeType],
                border: '1px solid ' + colors[el.nodeType]
            }, el.contentElement);
            VirtualNode.appendClasses(['content'], el.contentElement);

            el.blockElement.appendChild(el.contentElement);
            holder.appendChild(el.blockElement);
            if (el.children.length) {
                VirtualNode.appendClasses(['parent'], el.blockElement);
                registerToggler(el, 'open', notifyClasses);
                render(el.children, el.blockElement, level + 1);
            }

            notifyClasses(el);
        })

        return holder;
    }

    function notifyClasses(el) {
        el.contentElement.innerHTML = el.nodeName + ' ' + el.content;
        if (el.tag) {
            el.blockElement.classList.forEach(function (className) {
                el.contentElement.innerHTML += '.' + className;
            });
            el.contentElement.classList.forEach(function (className) {
                el.contentElement.innerHTML += '.' + className;
            });
            el.classList.forEach(function (className) {
                el.contentElement.innerHTML += '.' + className;
            });
        }
    }

    function registerToggler(el, className, cb) {
        if (!(el.contentElement instanceof Element)) throw new Error('That\'s not an element');
        var mainCb = function () {
            if (el.opened) {
                el.opened = false;
                el.blockElement.classList.remove(className);
            } else {
                el.opened = true;
                el.blockElement.classList.add(className);
            }
            cb && cb(el);
        };
        el.contentElement.addEventListener('click', mainCb);

        return function () {
            el.contentElement.removeEventListener('click', mainCb);
        };
    }


    return {
        vizualize: vizualize,
        virtualize: virtualize,
        VirtualNode: VirtualNode
    }
}(VirtualNode));