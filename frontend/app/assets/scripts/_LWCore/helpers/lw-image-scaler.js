import app from '../app';

const LWImageScaler = () => {
    $('[data-image]').each((index, element) => {
        const $element = $(element);
        if (!$element.data('image')) return;

        // Set flags
        const isMobile = $element.attr('data-w-mobile') && $(window).width() < 700;
        const isCropped = $element.attr('data-cropped') === '1';
        const call = $element.attr('data-type') === 'file' ? 'file' : 'imageScaled';
        const url = `${app.settings.scaleUrl}/${call}`;
        const query = {
            site: app.settings.imageScale,
            group: app.settings.scaleGroup,
            cropped: isCropped ? 0 : 1,
            orientation: $element.attr('data-orientation') ? $element.attr('data-orientation') : '',
            w: isMobile ? $element.attr('data-w-mobile') : $element.attr('data-w'),
            h: isMobile ? $element.attr('data-h-mobile') : $element.attr('data-h'),
            file: encodeURIComponent($element.attr('data-image'))
        };

        // Remove al data from element, a image should only be loaded once. Now you can call this function on new page
		// loads, yeah!
        $element.removeAttr('data-w');
        $element.removeAttr('data-h');
		$element.removeAttr('data-type');
		$element.removeAttr('data-image');
		$element.removeAttr('data-cropped');
        $element.removeAttr('data-w-mobile');
        $element.removeAttr('data-h-mobile');
        $element.removeAttr('data-orientation');
        $element.attr('data-image-scale-success', 1);

        // Append image with generated url to DOM
		const imageSrc = `${url}?${Object.keys(query).map(key => key + '=' + query[key]).join('&')}`;
        if ($element.is('img')) return $element.attr('src', imageSrc);
        return $element.css('background-image', `url('${imageSrc}')`);
    })
};

export default LWImageScaler;
