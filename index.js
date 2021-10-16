const Loader  = require( './dist' );
const packagedData = require( './loader.js' );
const Handler = new Loader({
    _partialInput: {
        "head": {
            "title": "Hello World",
            "desc": "Cool Description"
          },
        "footer": {
            "title": "Hello From Footer"
        }
    },
     partials: 'layout',
     verbose: true
});

// Server Side Rendering
console.log( Handler.getTemplate( 'home', packagedData().home ) )

console.log( '\n' );

//Simple Hard-Coded Pages
console.log( Handler.getTemplate( 'about', packagedData().about ) );
Handler.getTemplates();