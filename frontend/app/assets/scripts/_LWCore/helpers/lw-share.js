class LWShare {

	constructor() {
		$(document).on('click', '[share-channel]', (e) => {
			this.share({
				channel: $(e.currentTarget).attr('share-channel'),
				text: $(e.currentTarget).attr('share-text'),
				link: $(e.currentTarget).attr('share-link')
			});
			e.stopPropagation();
			e.preventDefault();
		});
	}

	share(customData) {
		const shareData = {
			channel: '',
			text: process.env.OG_DESCRIPTION,
			link: '',
			...customData
		};

		switch (shareData.channel) {
			case 'facebook':
				this.triggerFacebook(shareData);
				break;
			case 'twitter':
				this.triggerTwitter(shareData);
				break;
			case 'whatsapp':
				this.triggerWhatsapp(shareData);
				break;
			case 'copy':
				this.triggerCopy(shareData);
				break;
			case 'linkedin':
				this.triggerLinkedin(shareData);
				break;
			default:
				console.error(`Share channel '${shareData.channel}' not available`);
		}
	}

	triggerFacebook({channel, link, width = 550, height = 450}) {
		const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
		window.open(url, channel, `width=${width},height=${height},scrollbars=yes,toolbar=no,location=yes`);
	}

	triggerTwitter({channel, text, link, width = 550, height = 450}) {
		const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${text}`)}&url=${encodeURIComponent(`${link}`)}`;
		window.open(url, channel, `width=${width},height=${height},scrollbars=yes,toolbar=no,location=yes`);
	}

	triggerWhatsapp({text, link}) {
		const url = `https://wa.me/?text=${encodeURIComponent(`${text} ${link}`)}`;
		window.open(url);
	}

	triggerLinkedin({channel, link, width = 550, height = 450}){
		const url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(link)}`
		window.open(url, channel, `width=${width},height=${height},scrollbars=yes,toolbar=no,location=yes`);
	}

	triggerCopy({link}) {
		const tempForm = document.createElement('textarea');
		tempForm.style.position = 'absolute';
		tempForm.style.left = '-9999px';
		tempForm.style.top = '0';
		document.body.appendChild(tempForm);
		tempForm.textContent = link;

		// select the content
		var currentFocus = document.activeElement;
		tempForm.focus();
		tempForm.setSelectionRange(0, tempForm.value.length);

		// copy the selection
		var succeed;
		try {
			succeed = document.execCommand('copy');
			alert('De link is naar je klembord gekopieerd');
		} catch (e) {
			succeed = false;
		}

		// restore original focus
		if (currentFocus && typeof currentFocus.focus === 'function') {
			currentFocus.focus();
		}

		tempForm.textContent = '';

		return succeed;
	}
}

export default new LWShare();
