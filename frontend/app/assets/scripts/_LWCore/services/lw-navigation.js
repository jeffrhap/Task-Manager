import app from '../app';


export default class LWNavigation {

    constructor() {
        this.pageHash = 'home?foo=bar';
        this.pageSlug = 'home';
        this.pageParams = {foo: 'bar'};

        // Set default page on first load
        if (location.hash === '') location = location.origin + '#' + app.settings.pageDefault + location.search;

        // Register page changes
        setTimeout(() => {
            this._listen();
        })
    }

    _listen() {
        const root = this;
        $(window).off('hashchange').on('hashchange', function () {
            root.handleHashChange(location.hash.substring(1));
        });
        this.handleHashChange(location.hash.substring(1), true);
    }

    go(path = '#', query = null) {
    	let hash = `${path[0] !== '#' ? '#' : ''}${path}`;
		if(query) hash = `${hash}?${Object.keys(query).map(key => key + '=' + query[key]).join('&')}`;
		window.location.hash = hash;
	}

    handleHashChange(pageHash, forseReload = false) {
        const routeType = 'js';

        // Both hash and query did not change, do nothing
        if (!forseReload && pageHash === this.pageHash) {
            return false;
        }

        // Split slug and query from full hash.
        const pageSlug = pageHash.split('?')[0];
        const pageParams = this.parseQuery(pageHash.split('?')[1]);

        // Check if new page exists
        if (app.pages[pageSlug] === undefined) {
            console.error(`router: Page ${pageSlug} not found.`);
            return false;
        }

        // check if the old page has a scrollToTop, if so, set current scroll top. This will be used to scroll the page
        // back when a user navigates back to the page.
        if (app.pages[this.pageSlug].scrollToTop !== undefined) {
            app.pages[this.pageSlug].scrollToTop = $(`[data-page=${this.pageSlug}]`).scrollTop();
        }

        // Check if old page controller has a unload function and run if so.
        if ($.isFunction(app.pages[this.pageSlug]._unlisten)) {
            app.pages[this.pageSlug]._unlisten();
        }
        if ($.isFunction(app.pages[this.pageSlug]._unload)) {
            app.pages[this.pageSlug]._unload();
        }

        // Hide previous page
        if (routeType === 'js') {
            $(`[data-page=${this.pageSlug}]`).hide();
            $(`[data-page=${pageSlug}]`).show();
        } else {
            $(`[data-page=${this.pageSlug}]`).removeClass('active');
            $(`[data-page=${pageSlug}]`).addClass('active');
        }

        if (app.pages[pageSlug]) {
			app.pages[pageSlug].params = pageParams;
		}

        // Check if new page controller has a init function and run if so.
        if ($.isFunction(app.pages[pageSlug]._init)) {
            app.pages[pageSlug]._init(pageParams, pageSlug);
        }

        // Check if new page controller has a init function and run if so.
        if ($.isFunction(app.pages[pageSlug]._listen)) {
            app.pages[pageSlug]._listen();
        }

        // check if the new page has a scrollToTop already set. if so, scroll to value. If not, scroll to top
        if (app.pages[pageSlug].scrollToTop) {
            $(`[data-page=${pageSlug}]`).scrollTop(app.pages[pageSlug].scrollToTop);
        } else {
            $(`[data-page=${pageSlug}]`).scrollTop(0);
        }

        const links = document.querySelectorAll(`[href]`);

        // Auto Toggle active class for links
        for(let element of links) {
            if(element.getAttribute('href') === `#${this.pageHash}`) $(element).removeClass('active');
            if(element.getAttribute('href') === `#${pageHash}`) $(element).addClass('active');
        }

        this.pageHash = pageHash;
        this.pageSlug = pageSlug;
        this.pageParams = pageParams;
    }

    parseQuery(query) {
        if (!query || query === '') {
            return {};
        }
        return JSON.parse('{"' + query.replace(/&/g, '","').replace(/=/g, '":"') + '"}', function (key, value) {
            return key === '' ? value : decodeURIComponent(value)
        });
    }
}
