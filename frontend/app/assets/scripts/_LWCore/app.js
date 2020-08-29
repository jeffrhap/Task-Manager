import LWNavigation from './services/lw-navigation';
import LWImageScaler from './helpers/lw-image-scaler';

const app = {

    settings: {
        scaleUrl: null,
        scaleGroup: null,
        imageScale: null,
        environment: null,
        publicUrl: null,
        apiUrl: null,
        cmsInclude: null,
    },

    init: function() {
        console.log(app.settings, 'settings!')
        // Print full app to console when in development
        if (app.settings.environment !== 'production') {
            console.log(`environment: ${this.settings.environment}`);
            console.log('app', this);
        }

        if(JSON.parse(app.settings.cmsInclude.toLowerCase())){
            // Initialize global sections
            if (app.pages) {
                Object.keys(app.pages).map(sectionKey => {
                    if ($.isFunction(app.pages[sectionKey]._init)) app.pages[sectionKey]._init();
                    if ($.isFunction(app.pages[sectionKey]._listen)) app.pages[sectionKey]._listen();
                });
            }
        }

        // Initialize global sections
        if (app.sections) {
            Object.keys(app.sections).map(sectionKey => {
                if ($.isFunction(app.sections[sectionKey]._init)) app.sections[sectionKey]._init();
                if ($.isFunction(app.sections[sectionKey]._listen)) app.sections[sectionKey]._listen();
            });
        }

        // Initialize global components
        if (app.components) {
            Object.keys(app.components).map(componentKey => {
                if ($.isFunction(app.components[componentKey]._init)) app.components[componentKey]._init();
                if ($.isFunction(app.components[componentKey]._listen)) app.components[componentKey]._listen();
            });
        }
    
    

        if(!JSON.parse(app.settings.cmsInclude.toLowerCase())){
            // Run core helpers
            $('page').css('display', 'none')
            this.navigation = new LWNavigation();
        } else {
            $('page').css('display', 'block')
        }

        // app.navigation.go('upload', {id: 99});

        // Run image scaler
        LWImageScaler();
    }
};

$(document).ready(() => app.init());

export default app;
