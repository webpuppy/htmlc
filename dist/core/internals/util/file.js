"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fsUtil = void 0;
const __1 = require("..");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const debugger_1 = __importDefault(require("../debugger"));
class fsUtil {
    static readDir(dir) {
        return fs_1.default.readdirSync(dir)
            .filter(x => fs_1.default.lstatSync(path_1.default.join(dir, x)).isFile())
            .map(x => path_1.default.resolve(dir, x));
    }
    static loadUTF8(filePath) {
        return fs_1.default.readFileSync(filePath).toString('utf-8');
    }
    static mapData(filePath) {
        const n = filePath.split('.html');
        if (process.platform === 'win32') {
            const na = n[0].split('\\');
            const name = na[na.length - 1];
            const rawFile = this.loadUTF8(filePath);
            return { path: filePath, name, rawFile };
        }
        else {
            const na = n[0].split('/');
            const name = na[na.length - 1];
            const rawFile = this.loadUTF8(filePath);
            return { path: filePath, name, rawFile };
        }
    }
    static resolveTemplates(conf) {
        const { templates = __1.DEFAULTS.templates, pathRoot = __1.DEFAULTS.pathRoot } = conf;
        const _path = path_1.default.join(process.cwd(), pathRoot, templates);
        return _path ? this.readDir(_path).map(p => this.mapData(p)) :
            debugger_1.default.raise(`Error: finding templates in ${pathRoot}/${templates} `);
    }
    static resolvePartials(conf) {
        const { partials = __1.DEFAULTS.partials, pathRoot = __1.DEFAULTS.pathRoot } = conf;
        const _path = path_1.default.join(process.cwd(), pathRoot, partials);
        return _path ?
            this.readDir(_path).map(p => this.mapData(p)) :
            debugger_1.default.raise(`Error: finding templates in ${pathRoot}/${partials} `);
    }
}
exports.fsUtil = fsUtil;
//# sourceMappingURL=file.js.map