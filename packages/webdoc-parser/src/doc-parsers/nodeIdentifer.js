// @flow

export function nodeIdentifer(node: any): string {
  if (!node) {
    return "";
  }
  if (node.id) {
    return node.id.name;
  }
  if (node.key) {
    return node.key.name;
  }

  return "UnknownParsed" + node.loc.start.line;
}
