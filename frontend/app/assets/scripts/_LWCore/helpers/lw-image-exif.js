function getDataUrl(file) {
    return new Promise((resolve, reject) => {
        try {
            var callback = function (srcOrientation) {
                var reader2 = new FileReader();
                reader2.onload = function (e) {
                    var srcBase64 = e.target.result;
                    var img = new Image();

                    img.onload = function () {
                        var width = img.width,
                            height = img.height,
                            canvas = document.createElement('canvas'),
                            ctx = canvas.getContext("2d");

                        // set proper canvas dimensions before transform & export
                        if (4 < srcOrientation && srcOrientation < 9) {
                            canvas.width = height;
                            canvas.height = width;
                        } else {
                            canvas.width = width;
                            canvas.height = height;
                        }

                        // transform context before drawing image
                        switch (srcOrientation) {
                            case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
                            case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
                            case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
                            case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
                            case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
                            case 7: ctx.transform(0, -1, -1, 0, height, width); break;
                            case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
                            default: break;
                        }

                        // draw image
                        ctx.drawImage(img, 0, 0);

                        // export base64
                        resolve(canvas.toDataURL());
                    };

                    img.src = srcBase64;
                };

                reader2.readAsDataURL(file);
            };

            var reader = new FileReader();
            reader.onload = function (e) {

                var view = new DataView(e.target.result);
                if (view.getUint16(0, false) != 0xFFD8) return callback(-2);
                var length = view.byteLength, offset = 2;
                while (offset < length) {
                    var marker = view.getUint16(offset, false);
                    offset += 2;
                    if (marker == 0xFFE1) {
                        if (view.getUint32(offset += 2, false) != 0x45786966) return callback(-1);
                        var little = view.getUint16(offset += 6, false) == 0x4949;
                        offset += view.getUint32(offset + 4, little);
                        var tags = view.getUint16(offset, little);
                        offset += 2;
                        for (var i = 0; i < tags; i++)
                            if (view.getUint16(offset + (i * 12), little) == 0x0112)
                                return callback(view.getUint16(offset + (i * 12) + 8, little));
                    }
                    else if ((marker & 0xFF00) != 0xFF00) break;
                    else offset += view.getUint16(offset, false);
                }
                return callback(-1);
            };
            reader.readAsArrayBuffer(file);
        } catch (e) { reject(e) }
    })
}

class lwImageClass {

  /**
   *
   * @param file
   * @param options
   */
  constructor(file, options = {}) {
    const defaultOptions = {
      maxWidth: undefined, // defaults to origin image width
      maxHeight: undefined, // defaults to origin image height
      quality: 0.8,
      mimeType: 'png',
      format: 'dataUrl' // dataUrl, blob, DOMElements
    };
    this.file = file;

    // extend the default options with provided options
    this.options = {
      ...defaultOptions,
      options
    };
  }

  /**
   *
   * @return {Promise<*>}
   */
  async export() {
    this.dataUrl = await getDataUrl(this.file);
    if (this.options.format !== 'dataUrl') {
        return this[this.options.format]();
    } else {
        return this.dataUrl;
    }
  }

  DOMElement(mimeType) {

  }

  /**
   *
   * @param mimeType
   * @return {Blob}
   */
  blob() {
    const dataURI = this.dataUrl;

    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);

    // create a view into the buffer
    var ia = new Uint8Array(ab);

    // set the bytes of the buffer to the correct values
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob, and you're done
    var blob = new Blob([ab], {type: mimeString});
    return blob;
  }

}

/**
 *
 * @param file
 * @param options
 * @return {Promise<any>}
 * @constructor
 */
const LwImageExif = (file, options) => {
  return new Promise(async(resolve, reject) => {
    try{
      const image = new lwImageClass(file, options);
      resolve(await image.export());
    } catch(e) { reject(e) }
  });
};

export default LwImageExif;


