var VirtualNode = (function () {
    var color = {};
    color[Node.ELEMENT_NODE] = '#60a2ff';
    color[Node.TEXT_NODE] = '#ff9a2e';
    color[Node.COMMENT_NODE] = '#3d9929';

    function VirtualNode(el) {
        this.tag = el.tagName;
        this.children = [];
        this.nodeType = el.nodeType;
        this.nodeName = el.nodeName;
        this.classNames = el.className ? el.className.split(' ').map(c => '.' + c) : [];
        this.opened = false;
        this.content = el.nodeValue === null ?
            '' : el.nodeValue.trim();
        this.holderElement = document.createElement('div');
        this.contentElement = document.createElement('div');
        this.init();
    }

    VirtualNode.prototype.init = function () {
        this.holderElement.appendChild(this.contentElement);
        VirtualNode.appendClasses(['holder'], this.holderElement);
        VirtualNode.appendClasses(['content'], this.contentElement);
        this.updateColor();
    }

    VirtualNode.prototype.getContent = function () {
        return (this.nodeName || this.tag) +
            ' ' + this.content + ' ' +
            this.classNames.join('');
    }

    VirtualNode.prototype.updateColor = function () {
        this.contentElement.style.backgroundColor = color[this.nodeType];
    }

    VirtualNode.appendClasses = function (classList, el) {
        classList = Array.isArray(classList) ? classList : [];
        classList.forEach(function (className) {
            el.classList.add(className);
        });
    }

    VirtualNode.appendStyles = function (styleObject, el) {
        for (var i in styleObject) {
            if (styleObject.hasOwnProperty(i)) {
                el.style[i] = styleObject[i];
            }
        }
    }

    return VirtualNode;
}());

var Visualization = (function (VirtualNode) {
    function virtualize(el) {
        var elements = [];
        el.childNodes.forEach(function (child) {
            var virtualElement = new VirtualNode(child);
            virtualElement.children =
                virtualElement.children.concat(virtualize(child))
            elements.push(virtualElement);
        })
        return elements;
    }

    function visualize(virtualizedDOM) {
        var div = document.createElement('div');
        render(virtualizedDOM, div, 0);
        return div;
    }

    function render(virtualizedDOM, holder, level) {
        virtualizedDOM.forEach(function (virtualElement) {
            holder.appendChild(virtualElement.holderElement);
            virtualElement.contentElement.innerHTML =
                virtualElement.getContent();

            VirtualNode.appendStyles({
                marginLeft: (level * 15) + 'px'
            }, virtualElement.holderElement);

            if (virtualElement.children.length) {
                VirtualNode.appendClasses(['parent'],
                    virtualElement.holderElement);
                render(virtualElement.children,
                    virtualElement.holderElement, level + 1);
                toggle(virtualElement, 'open');
            }
        });
    }

    function toggle(virtualElement, className) {
        virtualElement.contentElement.addEventListener('click', function () {
            if (virtualElement.holderElement.classList.contains(className)) {
                virtualElement.holderElement.classList.remove(className);
            } else {
                virtualElement.holderElement.classList.add(className);
            }
        })
    }

    return {
        virtualize: virtualize,
        visualize: visualize
    }
}(VirtualNode));