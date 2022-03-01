import { Runtime } from '../loader';
export declare namespace coreInternal {
    type EventName = string;
    type EventArgs<T> = [
        T,
        Runtime.Context,
        IArguments
    ];
    interface CompilerArgs {
        template_name: string;
        ctx: Runtime.Context;
        data?: UINSERT_MAP;
    }
    type Entry = Array<string | UINSERT_MAP>;
    type Insertion = [
        string | UINSERT_MAP,
        Entry
    ];
    type _match = RegExpMatchArray | [];
    type UINSERT_MAP = object;
    interface compiledMap extends UINSERT_MAP {
        partialInput: UINSERT_MAP;
    }
    interface RenderMap {
        todo_partials: _match;
        todo_keys: _match;
        todo_loops: _match;
    }
    type Resolved<RenderMap> = {
        raw: string;
        renderMap: RenderMap;
        insertionMap: UINSERT_MAP;
        render: string;
    };
    type StackItem = {
        replacer: Runtime.template;
        insertion: Runtime.template | Runtime.template[] | Runtime.template[][];
    };
    type RenderTemplateArgs = {
        _toInsert: Object;
        raw: string;
        conf: Runtime.Options;
    };
    type Template = {
        path: string;
        args: RenderTemplateArgs;
        valueOf: string;
    };
}
export declare namespace hclFS {
    type TargetDirectoryTree = {
        path: string;
        files: string[];
    };
    type FileInputMeta = {
        path: string;
        name: string;
        rawFile: string;
    };
    type fileUTF8 = string;
}
export declare type _templateInsert = object | {} | any | null;
export interface TemplateInsertion {
    partialInput?: TemplateInsertion;
}
export declare type Dictionary<ReservedWord> = Array<ReservedWord>;
export declare type ReservedWord = {
    key: string;
    boolean: (target: string, arr: string) => boolean;
    array: (target: string) => RegExpMatchArray | null;
};
export interface LoaderContext {
    conf: Runtime.Context;
    template: (name: string, data?: object) => Runtime.template;
}
export declare const _DEFAULTS: Runtime.Options;
export declare const DEFAULTS: {
    _publishDefault: string;
    outDefault: string;
    static_config: {
        pathRoot: string;
        partials: string;
        templates: string;
        outPath: string;
        loaderFile: string;
        cleanup: boolean;
    };
    pathRoot?: string;
    templates?: string;
    partials?: string;
    partialInput?: object;
    templateInput?: object;
    watch?: boolean;
    debug?: boolean;
};
export declare class hclDebugger {
    constructor();
    static _registerEvent(...args: coreInternal.EventArgs<coreInternal.EventName>): void;
}
