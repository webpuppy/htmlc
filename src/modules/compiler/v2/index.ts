import {
    CompilerArgs, Token,
    AST_MAP, LoaderContext, TargetReplaceBuffer, TemplateTuple
} from '../../../types';
import * as ParserV2 from './parser';
import { cleanHTML } from '../../../internal/util/html';

function replaceIteratorKey(
    chunk: string,
    loop: Token,
    input: object
): string {
    const rawContext = loop.raw;
    const outStack = [];
    input[loop.name].forEach( ( entry: string | object ) => {
        const mask = rawContext.split( `<!--@loop(${loop.name}){` ).pop().split( '}-->' ).shift().trim();
        if( mask.includes( '{_}' ) ) {
            outStack.push( mask.replace( '{_}', <string>entry ) );
        }
        else {
            // if the array iterator has {foo} and {bar}, the input will be { foo: 'foo', bar: 'bar' }
           outStack.push( ParserV2.mask( mask, <object>entry ) );
        }
    } );
    return chunk.replace( loop.raw, outStack.join( '' ) );
}

function replaceKeyValue(
    chunk: string,
    key: Token,
    input: object
): string {
    console.log( chunk );
    console.log( key );
    if( !key.name.includes( '.' ) ) {
        chunk = chunk.replace( key.raw, input[key.name] );
        return chunk;
    }
    const splitterBase = key.name.split( '.' );
    const rootAncestor = splitterBase.shift();
    const matchedInput = Object.entries( input ).filter( ( i: [ string, object ] ) => i[0] === rootAncestor ).shift();
    chunk = chunk.replace( key.raw, matchedInput[1][splitterBase.shift()] );
    return chunk;
}


function resolveTokenMap(
    tokens: AST_MAP,
    ctx: LoaderContext,
    data: object,
    chunk: string
): string {
    const { config, chunks } = ctx;
    const input = { ...config.partialInput, ...config.templateInput, ...data };
    const partials = chunks.filter( chunk => chunk.type === 'partial' );
    const todoPartials = tokens.todo_partials.map( data => {
        return {
            ...data,
            registryMatch: partials.filter( partial => partial.name === data.name ).shift()
        };
    } );
    todoPartials.forEach( ( curr ) => chunk = chunk.replace( curr.raw, curr.registryMatch?.renderedChunk ?? curr.registryMatch?.rawFile ) );
    const newTokens = ParserV2.tokenize( chunk );
    newTokens.todo_keys.forEach( key => chunk = replaceKeyValue( chunk, key, input ) );
    newTokens.todo_loops.forEach( loop => chunk = replaceIteratorKey( chunk, loop, input ) );
    return cleanHTML( chunk, ctx.config.intlCode );
}

export function compile (
    args: CompilerArgs
): string {
    const registry = args.caller_ctx.chunks;
    const match = registry.filter( chunk => chunk.name === args.template_name ).shift();
    const toParse = ParserV2.hasSymbols( match.rawFile );
    // nothing to compile
    if( !toParse ) return match.rawFile;
    const tokens = ParserV2.tokenize( match.rawFile );
    return resolveTokenMap( tokens, args.caller_ctx, args.caller_data, match.rawFile );
}
