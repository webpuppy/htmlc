import { 
	TargetMatchBuffer,
	TargetReplaceBuffer,
	Insertion,
	Entry,
	DEP_TAG,
	RenderMap
} from './internals/types';
import { emitWarning } from 'process';
import { ReservedWord } from './internals/types';

export default class Parser {

	static DEPRECATED_TAGS: DEP_TAG[] = [
		{ 
			old: '@render-partial', 
			new: '@partial',
			v_change: '0.4.5'
		},
		{ 
			old: '@for', 
			new: '@loop',
			v_change: '0.4.5'
		}
	];

	static _delim = '{_}';
	static __CLOSE__ = '-->';
	static LOOP_CLOSE = `}${Parser.__CLOSE__}`;
	
	static LOOP_OPEN = ( key: string ): string => `<!--${Parser.__loopKey__}(${key}){`;

	static _renderKey = 'render';
	static __renderKey__ = `@${Parser._renderKey}`;
	static _partialKey = 'partial';
	static __partialKey__ = `@${Parser._partialKey}`;
	static _loopKey = 'loop';
	static __loopKey__ = `@${Parser._loopKey}`;

	static _loopSignature = `<!--${Parser.__loopKey__}(${Parser._delim}){}${Parser.__CLOSE__}`;
	static _keySignature = `<!--${Parser.__renderKey__}=${Parser._delim}${Parser.__CLOSE__}`;
	static _partialSignature = `<!--${Parser.__partialKey__}=${Parser._delim}${Parser.__CLOSE__}`;

	static _keyReggie = /<!--@render=[\w|\d]+-->/gi;
	static _partialReggie = /<!--@partial=[\w|\d]+-->/gi;

	private static _replaceSignature( type: string, val: string ) {
		switch( type ) {
			case Parser._partialKey:
				return Parser._partialSignature.replace( Parser._delim, val );
			case Parser._loopKey:
				return Parser._loopSignature.replace( Parser._delim, val );
			default:
				return Parser._keySignature.replace( Parser._delim, val );
		}
	}

	static hasPartial = ( a: TargetMatchBuffer ) => a.target.includes( Parser._replaceSignature( Parser._partialKey, a.key ) );
	static partialIndex = ( a: TargetMatchBuffer ) => a.target.indexOf( Parser._replaceSignature( Parser._partialKey, a.key ) );
	static matchPartials = ( target: string ) => target.match( Parser._partialReggie );
	static replacePartial = ( a: TargetReplaceBuffer ) => a.target.replace( Parser._replaceSignature( Parser._partialKey, a.key ), a.value );

	static hasKey = ( a: TargetMatchBuffer  ) => a.target.includes( Parser._replaceSignature( Parser._renderKey, a.key ) );
	static matchKeys = ( target: string  ) => target.match( Parser._keyReggie );

	static hasLoop = ( a: TargetMatchBuffer ) => a.target.includes( `<!--${Parser.__loopKey__}(${a.key}){` );
	static matchLoops( target: string ) {
		const out: Array<string> = [];
		const _opener = /<!--@loop\(\w+\){/gi;
		const opener = target.match( _opener );
		if( opener && opener?.length > 0 ) {
			opener.forEach( ( match: string ) => {
				const chopBottom = target.slice( target.indexOf( match ), target.length );
				if( chopBottom ) {
					const ret = chopBottom?.slice( 0, chopBottom.indexOf( Parser.LOOP_CLOSE ) + Parser.LOOP_CLOSE.length );
					if ( ret ) out.push( ret );
				}
			} );
		}
		return out;
	}

	static replaceAnonLoopBuf = ( a: TargetMatchBuffer ) => a.target.replace( Parser._delim, a.key );
	static replacedNamedLoopBuf( copy: string, insert: Insertion | Entry ) {
		insert.forEach( ( insertion: string | object ) => copy = copy.replace( `{${insertion[0]}}`, insertion[1] ) );
		return copy;
	}

	static ABT:
	ReservedWord[] = [
		{
			key: Parser.__loopKey__,
			boolean: Parser.hasLoop,
			array: Parser.matchLoops
		},
		{
			key: Parser.__renderKey__,
			boolean: Parser.hasKey,
			array: Parser.matchKeys
		},
		{
			key: Parser.__partialKey__,
			boolean: Parser.hasPartial,
			array: Parser.matchPartials
		}
	];

	static renderMap( content: string ) {
		const rmap: RenderMap = {
			todo_keys: [],
			todo_loops: [],
			todo_partials: []
		};
		Parser.ABT.forEach( token => {
			const keymap = token.array( content );
			switch( token.key ) {
				case Parser.__renderKey__:
					keymap ? rmap.todo_keys = keymap: rmap.todo_keys = [];
					break;
				case Parser.__loopKey__:
					keymap ? rmap.todo_loops = keymap: rmap.todo_loops = [];
					break;
				case Parser.__partialKey__:
					keymap ? rmap.todo_partials = keymap: rmap.todo_partials = [];
					break;
				default:
					break;
			}
		} );
		return rmap;
	}

	static checkDeprecation( clone: string ) {
		for( const tag of Parser.DEPRECATED_TAGS ) {
			if( clone.includes( tag.old ) ) {
				emitWarning( `Warning: ${tag.old} was deprecated in version ${tag.v_change}\n` );
				emitWarning( `Replace ${tag.old} with ${tag.new} if you are using a version later than ${tag.v_change}` );
			}
		}
	}
}
