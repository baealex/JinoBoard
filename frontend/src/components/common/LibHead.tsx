import Head from 'next/head';

import Config from '../../modules/config.json';

function minify(str: string) {
    str = str.replace(/\s/g, '');
    str = str.replace(/function/g, 'function ');
    str = str.replace(/var/g, 'var ');
    str = str.replace(/new/g, 'new ');
    return str;
}

export default function() {
    return (
        <Head>
            <link
                rel="stylesheet"
                href="https://use.fontawesome.com/releases/v5.0.13/css/all.css"
                integrity="sha384-DNOHZ68U8hZfKXOrtjWvjxusGo9WQnrNx2sqG0tfsghAvtVlRW3tvkXWZh58N9jp"
                crossOrigin="anonymous"/>
            <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/css?family=Noto+Serif+KR|Noto+Sans+KR|Black+Han+Sans"/>
            <link
                rel="stylesheet"
                href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css"
                integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk"
                crossOrigin="anonymous"
            />
            <link
                rel="stylesheet"
                href="https://rawcdn.githack.com/nzbin/three-dots/c592f34f85813ce75b9bc984b1bafcea3cb39b37/dist/three-dots.min.css"
            />
            {Config.GOOGLE_ANALYTICS_V4 ? (
                <>
                    <script async src="https://www.googletagmanager.com/gtag/js?id=G-VD3ZLTR4ZQ"></script>
                    <script dangerouslySetInnerHTML={{ __html: minify(`
                        window.dataLayer = window.dataLayer || [];
                        function gtag() {
                            dataLayer.push(arguments);
                        }
                        gtag('js', new Date());
                        gtag('config', '${Config.GOOGLE_ANALYTICS_V4}');
                    `)}}/>
                </>
            ) : ''}
            {Config.MICROSOFT_CLARITY ? (
                <script dangerouslySetInnerHTML={{ __html: minify(`
                    (function(c, l, a, r, i, t, y) {
                        c[a] = c[a] || function() {
                            (c[a].q = c[a].q || []).push(arguments)
                        };
                        t = l.createElement(r);
                        t.async = 1;
                        t.src = "https://www.clarity.ms/tag/" + i;
                        y = l.getElementsByTagName(r)[0];
                        y.parentNode.insertBefore(t,y);
                    })(window, document, "clarity", "script", "${Config.MICROSOFT_CLARITY}");
                `)}}/>
            ): ''}
        </Head>
    )
}