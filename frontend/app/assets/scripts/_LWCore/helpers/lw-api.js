/**
 * LWApi is used to connect to the api set as default by the .env. Do you want to use a custom url? Use a
 * full url including http/https and host.
 */

class LWApi {

	/**
	 * Make executable request object
	 * @param options
	 * @param method
	 * @param url
	 * @param query
	 * @param body
	 * @param formData
	 * @param progressCallback
	 */
	static generateRequest(options, method, url, query = {}, body = false, formData = false, progressCallback = false) {

		// Generate query, by merging defaults with arguments
		const mergedQuery = $.extend({}, LWApi.userCredentials(), query);
		const request = {
			method: method.toUpperCase(),
			url: url.search('http') > -1 ? url : `${options.apiUrl}/${url}`
		};

		// If query object exists, serialize and add to url
		if (Object.keys(mergedQuery).length > 0) {
			request.url = `${request.url}?${LWApi.serialize(mergedQuery)}`;
		}

		// If body data is set and method supports body, add it to the fetch
		if ((method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT') && body) {
			if (formData) {
				request.data = new FormData();
				request.processData = false;
				request.contentType = false;
				Object.keys(body).map(key => request.data.append(key, body[key]));
			} else {
				request.data = body;
			}
		}

		// If a progress callback has been set, add it to the fetch
		if (progressCallback) {
			request.xhr = () => {
				const xhr = $.ajaxSettings.xhr();
				xhr.upload.onprogress = (e) => progressCallback(Math.floor(e.loaded / e.total * 100));
				return xhr;
			}
		}

		return request;
	}


	/**
	 * Check if user credentials are set in local storage. If so, add to request query.
	 * @todo: move credentials to request headers when API is ready.
	 * @return {*}
	 */
    static userCredentials() {
        return (localStorage.getItem('userId') && localStorage.getItem('userToken')) ? {
            userId: localStorage.getItem('userId'),
            userToken: localStorage.getItem('userToken')
        } : {};
    };


	/**
	 * Transform object to query string
	 * @param obj
	 * @return {string}
	 */
	static serialize(obj) {
        const str = [];
        for (const p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
            }
        return str.join('&');
    };


	/**
	 * Initialize API and set options
	 */
    constructor() {
        this.options = {
            apiUrl: process.env.HOST_API
        };
    }


	/**
	 * Make the actual fetch
	 * @param method
	 * @param url
	 * @param query
	 * @param body
	 * @param formData
	 * @param progressCallback
	 * @return {Promise<any>}
	 */
    fetch(method, url, query, body, formData, progressCallback) {
       const request = LWApi.generateRequest(this.options, method, url, query, body, formData, progressCallback);

       // Return a native Promise implementation of the jQuery ajax method.
        return new Promise(function (resolve, reject) {
            $.ajax(request)
                .done(function (response) {
                    resolve(response, request);
                })
                .fail(function (response) {
                    const error = $.extend(
                        request,
                        response,
                        {
                            status: response.status,
                            error: response.statusText
                        }
                    );
                    // @todo: user is not authenticated, logout user
                    console.error(error);
                    reject(error);
                });
        });
    };


	/**
	 * Make a get request
	 * @param url
	 * @param query
	 * @return {Promise<any>}
	 */
    get(url, query) {
        return this.fetch('get', url, query);
    };


	/**
	 * Make a post request
	 * @param url
	 * @param body
	 * @param query
	 * @return {Promise<any>}
	 */
	post(url, body, query) {
        return this.fetch('post', url, query, body);
    };


	/**
	 * Make a formData post request
	 * @param url
	 * @param body
	 * @param query
	 * @param progressCallback
	 * @return {Promise<any>}
	 */
    formData(url, body, progressCallback) {
        return this.fetch('post', url, {}, body, true, progressCallback);
    };


	/**
	 * Make a put request
	 * @param url
	 * @param body
	 * @param query
	 * @return {Promise<any>}
	 */
	put(url, body, query) {
        return this.fetch('put', url, query, body);
    };


	/**
	 * Make a delete request
	 * @param url
	 * @param query
	 * @return {Promise<any>}
	 */
    delete(url, query) {
        return this.fetch('delete', url, query);
    };
}

export default new LWApi();
