// @flow
// TODO: WebdocParser API & use it in registerWebdocParser in parser-plugin.js. Bring that function
// here

import {registerValidator} from "./validators";

export class WebdocParser {
  installValidator = registerValidator;
}
