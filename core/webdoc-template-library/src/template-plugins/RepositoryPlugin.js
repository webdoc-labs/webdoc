// @flow

import {type Doc} from "@webdoc/types";
import {autoDetectRepository} from "../Repository";

export const RepositoryPlugin = {
  buildRepository(url: string): void {
    this.integration = autoDetectRepository(url);
  },
  linkTo(doc: Doc): string {
    return this.integration.linkTo(doc);
  },
};
