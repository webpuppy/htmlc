/* eslint-disable no-case-declarations */

import { 
	FileInputMeta,
	RenderMap,
	Args,
	RTemplate,
	UINSERT_MAP,
	compiledMap,
	Resolved,
	StackItem,
} from './internals/types';
import render from '.';
import Debugger from './internals/debugger';
import RESERVED_WORDS from './abt';
import Parser from './parser';
import { MappedEntry, MappedValue } from '../loader';


export default class Compiler {

	static scanTemplate( args: Args ) {
		try {
			const fileData = args.ctx.templates.filter( ( temp: FileInputMeta ) => temp.name === args.template_name )[0];
			return fileData.rawFile;
		}
		catch( e ) {
			// Debugger.raise( `Template '${args.template_name} not found'` );
		}	
	}

	static __renderMap( content: string ) {
		const __map__: RenderMap = {
			todo_keys: [],
			todo_loops: [],
			todo_partials: []
		};

		RESERVED_WORDS.forEach( token => {
			const keymap = token.array( content );
			switch( token.key ) {
				case Parser.__renderKey__:
					keymap ? __map__.todo_keys = keymap: __map__.todo_keys = [];
					break;
				case Parser.__loopKey__:
					keymap ? __map__.todo_loops = keymap: __map__.todo_loops = [];
					break;
				case Parser.__partialKey__:
					keymap ? __map__.todo_partials = keymap: __map__.todo_partials = [];
					break;
				default:
					break;
			}
		} );
	
		return __map__;
	}

	static compile( 
		args: Args 
	): RTemplate {
		/**
		 * If any data was keyed with the template name in the constructor, we will use as a secondary priority load value
		 * these objects will default to {} if not entered
		 */
		const {templateInput = {}, partialInput = {}} = args.ctx.config;
		// unset null data if applicable
		if( !args.data ) args.data = {};
	
	
		//if no data, load default input for template
		const globalInsertions:
		UINSERT_MAP = templateInput;
		if( Object.keys( args.data ).length === 0 ) {
			const insertions:
			compiledMap = {...globalInsertions, partialInput};
			// Debugger._registerEvent( 'template::insert:args', args.ctx );
			return render( args.ctx.partials, Compiler.scanTemplate( args ), insertions );
		}
		else {
			const scopedInsertions:
			UINSERT_MAP = {...templateInput, ...args.data};
			const insertions:
			compiledMap = {...globalInsertions, ...scopedInsertions,
				partialInput: {
					...partialInput,
					...args.data['partialInput']
				}
			};
	
			// Debugger._registerEvent( 'insert', args.ctx );
			return render( args.ctx.partials, Compiler.scanTemplate( args ), insertions );
		}
	}
	
	static resolve (
		file: string,
		renderMap: RenderMap,
		insertionMap: UINSERT_MAP,
		debug ?: boolean
	): Resolved<RenderMap> {
		let render = file;
		const outVal: StackItem[] = [];
		const outObj: StackItem[] = [];

		// console.log( insertionMap );
		// console.log( renderMap );

		/**  this is an entry in render map, as a tuple in the form of
		 * [ ENTRY_TYPE, ENTRY_LIST ]
		 * ENTRY_TYPE will be either todo_keys, todo_loops, todo_partials
		**/
		for( const [ key, value ] of Object.entries( renderMap ) ) {
			const itemlist = [ key, value ] as MappedEntry;
			itemlist[1].forEach( ( r: MappedValue ) => {
				switch( itemlist[0] ) {
					case 'todo_keys':
						r = r as string;
						const name = r.split( `${Parser.__renderKey__}=` )[1].split( Parser.__CLOSE__ )[0];
						const globals = insertionMap;
						let replaceVal = insertionMap[name];
						if( !replaceVal ) {
							try {
								replaceVal = globals[name];
							}
							catch( e ) {
								// Debugger.raise( `Failed to find ${name} to insert into ${file}`);
								replaceVal = '';
							}
						}
						render = render.replace( r, replaceVal );
						break;
					case 'todo_loops':
						r = r as string;
						const loopName = r.split( '(' )[1]?.split( ')' )[0];
						const toInsert = insertionMap[loopName];
						const elChild: string = r.replace( Parser.LOOP_OPEN( loopName ), '' ).replace( Parser.LOOP_CLOSE, '' )
						.trimStart().replace( /\s\s+/gi, '' );

						toInsert?.forEach( ( insertion ?: string | UINSERT_MAP ) => {
							r = r as string;
							if( typeof( insertion ) === 'string' ) {
								//1d array
								outVal.push( { 
									replacer: r, 
									insertion: Parser.replaceAnonLoopBuf( {target: elChild, key: insertion as string} ) 
								} );
							}
							else if ( typeof( insertion ) === 'object' ) {
								//key/val
								const entries = Object.entries( insertion );
								if ( entries.length > 0  ) outObj.push( { 
									replacer: r, 
									insertion: Parser.replacedNamedLoopBuf( elChild, entries ) 
								} );
							}
							else {
								// Debugger.raise( `warning: insertion ${loopName} has an unrecognized value of:\n` );
								// Debugger.raise( insertion );
							}
						} );
						break;
					case 'todo_partials':
						//for partials nested in partials - WIP feature
						break;
					default:
						break;
				}
			} );
		}

		const valStr = outVal.map( ( val: StackItem ) => val.insertion ).join( '' );
		const objStr = outObj.map( ( obj: StackItem ) => obj.insertion ).join( '' );
		outVal.forEach( ( _out: StackItem ) => render = render.replace( _out.replacer, valStr ) );
		outObj.forEach( ( _out: StackItem ) => render = render.replace( _out.replacer, objStr ) );
		Parser.checkDeprecation( render );
		return {
			raw: file, 
			renderMap, 
			insertionMap, 
			render
		};
	}

	static resolveDeclaredPartials( 
		renMap: RenderMap, 
		declaredPartials: FileInputMeta[], 
		insertMap: UINSERT_MAP,
		rootCopy: string
	): string {
		let rc = rootCopy;
		renMap.todo_partials.forEach( ( partialSeg: string ) => {
            const p_name = partialSeg.split( `${Parser.__partialKey__}=` )[1].split( Parser.__CLOSE__ )[0];
            const matchPartials = declaredPartials.filter( n => n.name === p_name );
            if( matchPartials.length > 0 ) {
                matchPartials.forEach( partial => {
                    const renderMap = Compiler.__renderMap( partial.rawFile );
                    const scoped_insertion = insertMap['partialInput'] ?? {};
                    const insertion = {...insertMap, ...scoped_insertion};
                    const resolved = Compiler.resolve( partial.rawFile, renderMap, insertion );
                    rc = rc.replace( partialSeg, resolved.render );
                } );
            }
        } );

		return rc;
	}

	static resolveDeclaredKeys(
		renMap: RenderMap, 
		insertMap: UINSERT_MAP,
		rootCopy: string
	): string {
		let rc = rootCopy;
		renMap.todo_keys.forEach( _ => {
            const renderMap = Compiler.__renderMap( rootCopy );
            const resolved = Compiler.resolve( rootCopy, renderMap, insertMap );
            rc = resolved.render;
        } );
		return rc;
	}

	static resolveDeclaredLoops(
		renMap: RenderMap,
		insertMap: UINSERT_MAP,
		rootCopy: string
	): string {
		let rc = rootCopy;
		renMap.todo_loops.forEach( _ => {
            const renderMap = Compiler.__renderMap( rootCopy );
            rc = Compiler.resolve( rc, renderMap, insertMap ).render;
        } );
		return rc;
	}
}