import loader from '../dist';
const myLoader = loader( {
    pathRoot: 'test-pkg/barebones',
    partials: 'partials',
    templates: 'templates',
    templateInput: {},
    partialInput: {}
});
describe( 'Load Static Partial Data', () => {
    const home = myLoader.template( 'home' );
    
    it( 'Loads Head', () => {
        expect( home ).toMatch( '<title>Hello World</title>' );   
    } );

    it( 'Loads Nav', () => {
        expect( home ).toMatch( '<nav>' );
        expect( home ).toMatch( '</nav>' );
    } );

    it( 'Loads Page Content', () => {
        expect( home ).toMatch( '<main>Home Page</main>' );
    } );

    it( 'Loads Footer', () => {
        expect( home ).toMatch( '<footer>Footer</footer>' );
    } );
} );