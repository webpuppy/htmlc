/**
 * @module fs internal file handling
 */
import {
	HTMLChunk,
	HTMLChunkType,
	SSROptions
} from '../../types';
import {
	readdirSync,
	readFileSync,
	statSync
} from 'fs';
import {
	join,
	resolve
} from 'path';
import { HCL_DEFAULTS } from '..';
export const __WIN__ = '\\';
export const __BSD__ = '/';

export function validFileList(
	dir: string
): string[] {
	return readdirSync( dir )
	.filter( x => statSync( join( dir, x ) ).isFile() && x.includes( '.html' ) )
	.map( x => resolve( dir, x ) );
}

export function mapPath(
	splitter: string[],
	basename: string,
	sysSplit: string
): string {
	let name = splitter[0];
	const na = name.split( sysSplit );
	name = na[na.length - 1];
	const base = na.indexOf( basename );
	const offset = na.indexOf( name ) - base;
	if( offset > 1 ) {
		const prefixArr = [];
		for( let i = base+1; i < base+offset + 1; i++ ) {
			prefixArr.push( na[i] );
		}
		name =  prefixArr.join( '/' );
	}
	return name;
}

export function fileMap(
	path: string,
	splitter: string[],
	basename: string,
	type: HTMLChunkType
): HTMLChunk {
	return {
		type,
		path,
		rawFile: readFileSync( path ).toString( 'utf-8' ),
		name: mapPath( splitter, basename, process.platform === 'win32' ? __WIN__ : __BSD__ ),
		isCached: false,
		renderedChunk: null,
		needsRehydrate: false
	};
}

export function createFileMap(
	filepath: string,
	basepath: string,
	type: HTMLChunkType
): HTMLChunk {
	return fileMap( filepath, filepath.split( '.html' ), basepath, type );
}

export function readValidFSTree(
	dir: string,
): string[] {
	return readdirSync( dir ).map( file => {
		const filepath = join( dir, file );
		return statSync( filepath ).isDirectory() ? readValidFSTree( filepath ) : filepath;
	} ).flat();
}

export const mapPathList = (
	paths: string[],
	base: string,
	type: HTMLChunkType
): HTMLChunk [] => paths.map( ( file ) => createFileMap( file, base, type ) );


export function findPartials( { 
	partials = HCL_DEFAULTS.partials,
	pathRoot = HCL_DEFAULTS.pathRoot,
	discoverPaths = HCL_DEFAULTS.discoverPaths
}: SSROptions ): HTMLChunk[] | null {
	const root = join( process.cwd(), pathRoot, partials );
	if( !discoverPaths ) return validFileList( root ).map( file => createFileMap( file, partials, 'partial' ) ); 
	return mapPathList( readValidFSTree( root ), partials, 'partial' );
}

export function findTemplates( {
	templates = HCL_DEFAULTS.templates, 
	pathRoot = HCL_DEFAULTS.pathRoot,
	discoverPaths = HCL_DEFAULTS.discoverPaths
}: SSROptions ): HTMLChunk[] | null {
	const root = join( process.cwd(), pathRoot, templates );
	if( !discoverPaths ) return validFileList( root ).map( ( file ) => createFileMap( file, templates, 'template' ) ); 
	return mapPathList( readValidFSTree( root ), templates, 'template' );
}