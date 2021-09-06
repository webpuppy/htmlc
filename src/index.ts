import Template from './prerender/template';
import Partial from "./prerender/partials";

const p = new Partial( './views/layout/head.html', { order:0 } )
const p0 = new Partial( './views/layout/footer.html', { order: 1 } );
const t = new Template( [p, p0] , 'ssr' );
//console.log( );
t.render()