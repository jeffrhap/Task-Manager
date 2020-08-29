import app from 'LWCore';
import Home from 'pages/home';

/**
 *
 * App settings will be auto loaded from the .env file. You can override
 * this here if you really really want to.
 */
app.settings = {
    ...app.settings,
    environment: process.env.ENVIRONMENT,
    publicUrl: process.env.HOST_PUBLIC,
    apiUrl: process.env.HOST_API,
    scaleUrl: process.env.IMAGE_SCALE_URL,
    imageScale: process.env.IMAGE_SCALE,
    cmsInclude: process.env.CMS_INCLUDED,
	pageDefault: process.env.PAGE_DEFAULT
};


/**
 *
 * Register app pages
 */
app.pages = {
    home: new Home('[data-page=home]')
};


/**
 *
 * Register app sections
 */
app.sections = {

};


/**
 *
 * Register app components
 */
app.components = {

};

