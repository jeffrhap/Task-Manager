/**
 * LWController
 */

class LWController {

    constructor(selector) {
        this.params = {};
        this.selector = selector;
        this.$element = $(selector);
        this.scrollToTop = 0;
    }

    find(selector) {
        return this.$element.find(selector);
    }

    shouldReload(){
    	return true;
    }

}

export default LWController;
