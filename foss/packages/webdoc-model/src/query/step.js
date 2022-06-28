// @flow

import type {Doc, RootDoc} from "@webdoc/types";
import type {StepExpr} from "./types";

function stepMember(qualifier: string, doc: Doc): Doc[] {
  let stepMembers = doc.members.filter((child) => child.name === qualifier);

  if (doc.type === "RootDoc") {
    stepMembers = stepMembers.concat((doc: RootDoc).tutorials
      .filter((child) => child.name === qualifier));
  }

  return stepMembers;
}

function stepInstanceMember(qualifier: string, doc: Doc): Doc[] {
  return doc.members.filter((child) =>
    child.name === qualifier &&
    child.scope === "instance");
}

function stepInnerMember(qualifier: string, doc: Doc): Doc[] {
  return doc.members.filter((child) =>
    child.name === qualifier &&
    child.scope === "inner");
}

function stepRMember(qualifier: string, doc: Doc): Doc[] {
  return stepMember(qualifier, doc)
    .concat(doc.members.flatMap((member) => stepRMember(qualifier, member)));
}

const stepHandlers = {
  "member": stepMember,
  "instance-member": stepInstanceMember,
  "inner-member": stepInnerMember,
  "r-member": stepRMember,
};

export function step(stepExpr: StepExpr, doc: Doc): Doc[] {
  return stepHandlers[stepExpr.type](stepExpr.qualifier, doc);
}
