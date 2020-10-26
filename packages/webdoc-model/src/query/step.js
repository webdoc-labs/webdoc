// @flow

import type {Doc} from "@webdoc/types";
import type {StepExpr} from "./types";

function stepMember(qualifier: string, doc: Doc): Doc[] {
  return doc.members.filter((child) => child.name === qualifier);
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
  return stepHandlers[stepExpr.stepType](stepExpr.qualifier, doc);
}
