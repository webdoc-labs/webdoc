// @flow
// This module extracts the documentation comment from a node, if one exists.

import {CommentBlock} from '@babel/types';

/**
 * Extracts the documentation of the node, if one exists. This also handles the case where the node
 * itself is a documentation comment.
 *
 * @param {Node} node
 * @return {string}
 */
export default function extract(node: CommentBlock): ?string {
  const doc = node.value;
  node.documented = true;

  if (!doc) {
    return;
  }
  if (!doc.startsWith('*') && !doc.startsWith('!')) {
    return;
  }

  const docLines = doc.split('\n');

  for (let i = 0; i < docLines.length; i++) {
    docLines[i] = docLines[i].trim();

    if (docLines[i].startsWith('*')) {
      docLines[i] = docLines[i].replace('*', '').trimStart();
    }
  }

  return docLines.join('\n');
}
