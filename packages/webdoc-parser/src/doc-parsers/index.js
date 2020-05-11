// These doc-parsers are invoked when a trigger tag overrides the type of doc
// being made. (@class, @typedef, @function, @method, @property, @object, etc.)

export {parseMethodDoc} from "./parseMethodDoc";
export {parseTypedefDoc} from "./parseTypedefDoc";
export {parsePropertyDoc} from "./parsePropertyDoc";
export {parseEventDoc} from "./parseEventDoc";
