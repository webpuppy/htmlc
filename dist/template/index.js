"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class Template {
    constructor(config, name, path) {
        this.config = config;
        this.name = name;
        this.path = path;
        this.raw = fs_1.default.readFileSync(path).toString('utf-8');
        this.parsed = null;
        this.preload = null;
        this._preload();
    }
    _preload() {
        let _copy = this.raw;
        this.config.partials.forEach(p => {
            if (p.isParsed) {
                _copy = p.parsed;
            }
            else {
                _copy = _copy.replace(`<!--@render-partial=${p.name}-->`, p.parse());
            }
        });
        this.preload = _copy;
        return _copy;
    }
    _hasPartial(lbl) {
        const qry = `<!--@render-partial=${lbl}-->`;
        const _existsRaw = this.raw.indexOf(qry) !== -1;
        const _existsPre = this.preload.indexOf(qry) !== -1;
        return { _existsRaw, _existsPre };
    }
    _getIterator(txt) {
        const _reggie = /<!--@for\(\w+\){([\s|\w|<|=|"|:|/|\.({})>]+)-->/gi;
        return txt.match(_reggie);
    }
    _getIteratorBase(txt) {
        const _reggie = /<!--@for\(\w+\){\s+<(\w+)>{(\w+)}<\/\w+>\s+}-->/gi;
        return txt.match(_reggie);
    }
    _getIteratorDetail(txt) {
        const _i = /<!--@for\(\w+\){\s+<.+>{(\w+)}<\/\w+>\s+}-->/gi;
        return txt.match(_i);
    }
    _getAttrKeys(txt) {
        const _keys = /(\b\w+)=/g;
        return txt.match(_keys);
    }
    _getAttr(txt) {
        const _attr = /<[\s|\w|<|=|"|:|/|\.({})>]+>/g;
        return txt.match(_attr);
    }
    _getAttrValues(txt) {
        const _attr = /\"([^"]*)\"/g;
        return txt.match(_attr);
    }
    _getElementCopies(txt) {
        const _elements = /<.+>/g;
        return txt.match(_elements);
    }
    _parseTemplate(txt) {
        const _input = /{(\w+)}/gi;
        return txt.match(_input);
    }
    render(_varList) {
        var _a;
        let _copy = (_a = this.parsed) !== null && _a !== void 0 ? _a : this.raw;
        this.config.partials.forEach(p => {
            _copy = _copy.replace(`<!--@render-partial=${p.name}-->`, p.parsed);
        });
        if (_varList) {
            const iterable_map = Object.values(_varList).map(Array.isArray);
            const _iterable_map = iterable_map.filter(_ => _ === true);
            const num_iterables = _iterable_map.length;
            const iterators = this._getIterator(_copy);
            if (num_iterables === (iterators === null || iterators === void 0 ? void 0 : iterators.length)) {
                //input matches declarations
                const _dom = _copy;
                const _parser = Object.keys(_varList).map(x => {
                    const render_val = `<!--@render=${x}-->`;
                    const loop_val = `<!--@for(${x}){`;
                    if (_dom.includes(render_val)) {
                        return render_val;
                    }
                    if (_dom.includes(loop_val)) {
                        return loop_val;
                    }
                    return false;
                });
                function iterateObj(segment, entries) {
                    let shallow = segment;
                    Object.entries(entries).map(ent => {
                        shallow = shallow.replace(`{${ent[0]}}`, ent[1]);
                    });
                    return shallow;
                }
                let outVal = [];
                let outObj = [];
                _parser.forEach((p, idx) => {
                    const _iterator = iterators[idx - 1];
                    const match = Object.entries(_varList)[idx];
                    if (p && p.includes('render')) {
                        _copy = _copy.replace(p, match[1]);
                    }
                    else {
                        if (p && p.includes('for')) {
                            const _hLen = `<!--@for(${match[0]}){`;
                            const _tLen = '}-->';
                            match[1].forEach(matcher => {
                                let newIterator = _iterator;
                                //loop each submitted array item and create new element
                                newIterator = newIterator.replace(_hLen, '');
                                newIterator = newIterator.replace(_tLen, '');
                                const _el = newIterator.trim();
                                if (typeof (matcher) === 'string') {
                                    outVal.push({ 'child': _el.replace('{_}', matcher), parent: _iterator });
                                }
                                else {
                                    outObj.push({ 'child': iterateObj(_el, matcher), parent: _iterator });
                                }
                            });
                        }
                    }
                });
                const elArr = outVal.map(x => x.child).join('');
                const valArr = outObj.map(x => x.child).join('');
                outVal.forEach((_out) => _copy = _copy.replace(_out.parent, elArr));
                outObj.forEach(_out => _copy = _copy.replace(_out.parent, valArr));
            }
            this.parsed = _copy;
            return this.parsed;
        }
        else {
            return this.preload;
        }
    }
}
exports.default = Template;
//# sourceMappingURL=index.js.map