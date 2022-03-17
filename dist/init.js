"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const file_1 = require("./core/internals/util/file");
const internals_1 = require("./core/internals");
exports.default = (config) => {
    const hydrated = clean(config);
    return {
        config: hydrated,
        partials: file_1.fsUtil.resolvePartials(config),
        templates: file_1.fsUtil.resolveTemplates(config)
    };
};
const clean = (config) => Object.keys(config) === Object.keys(internals_1._DEFAULTS) ?
    config :
    Object.assign(Object.assign({}, internals_1._DEFAULTS), config);
//# sourceMappingURL=init.js.map