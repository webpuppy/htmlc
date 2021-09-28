# Simple Static Template Loading

about.html

    <!--@render-partial=head-->
    <!--@render-partial=nav-->
    <main>
        About Page
    </main>
    <!--@render-partial=footer-->

If we want to load partials and a simple static template page, we can call the constructor to pass any variables to our partial input (or have them static) and then call the template page without any arguments. 

    const Loader  = require( 'html-chunk-loader' );
    const Handler = new Loader({
        root: 'views',
        templates: 'pages',
        partials: 'partials',
        _partialInput: {
            head: {
                title: 'Hello World',
                desc: 'Cool Description Bro',
            },
            footer: {
                title: 'Hello From Footer'
            }
        }
    });

    console.log( Handler.getTemplate( 'about' ) );

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    <head>
    <title>Hello World</title>
    <meta name="description" content="Cool Description Bro"/>
    </head>
    <nav>
        <ul>
            <li>Home</li>
            <li>About</li>
        </ul>
    </nav>
    <main>
        About Page
    </main>
    <footer>
        <h5>Hello From Footer</h5>
    </footer>
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


To see how to parse template variables, [click here](https://github.com/abschill/html-chunk-loader/blob/master/docs/render_lists.md)