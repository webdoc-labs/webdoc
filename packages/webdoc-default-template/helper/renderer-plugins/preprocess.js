const path = require("path");

// Regex for matching <img> element with a capturing group for src attribute
const IMG_REGEX = /(<img [^<]*src=")([-\]_.~!*'();:@&=+$,/?%#[A-z0-9]*)("[^<]*>)/g;

exports.preprocessMarkupPlugin = ({
  assetsDir,
}) => function preprocessMarkup(
  markup /*: string */,
) /*: string */ {
  return markup.replace(IMG_REGEX,
    function(_, prefix /*: string */, src /*: string */, suffix /*: string */) {
      return `${prefix}/${path.join(assetsDir, String(src).trim())}${suffix}`;
    });
};
