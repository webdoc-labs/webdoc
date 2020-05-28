"use strict";

const {morphTutorials} = require("../lib/load-tutorials/morph-tutorials");
const expect = require("chai").expect;

describe("load-tutorials", () => {
  it("should morph tutorials correctly", () => {
    const tutorials = [
      {name: "A", members: []},
      {name: "B", members: []},
      {name: "C", members: []},
      {name: "D", members: []},
    ];

    const tutorialConf = {
      "B": {
        "title": "<B>",
      },
      "A": {
        title: "<A>",
        children: ["B", "C"],
      },
      "C": {
        "title": "<C>",
        "children": {
          "D": {
            "title": "<D>",
          },
        },
      },
    };

    const rootTutorials = morphTutorials(tutorials, tutorialConf);

    expect(tutorials[0].title).to.equal("<A>");
    expect(tutorials[1].title).to.equal("<B>");
    expect(tutorials[2].title).to.equal("<C>");
    expect(tutorials[3].title).to.equal("<D>");

    expect(rootTutorials.length).to.equal(2);

    const tutorialA = rootTutorials[1];

    expect(tutorialA.title).to.equal("<A>");
    expect(tutorialA.members.length).to.equal(2);

    const tutorialC = tutorialA.members[1];

    expect(tutorialC.members.length).to.equal(1);
    expect(tutorialC.members[0].title).to.equal("<D>");
  });

  it("should resolve multiple references to the same tutorial when morphing", () => {
    const tutorials = [
      {name: "A", members: []},
      {name: "B", members: []},
      {name: "C", members: []},
    ];

    const tutorialConf = {
      "B": {children: ["A"]},
      "C": {children: ["A"]},
    };

    morphTutorials(tutorials, tutorialConf);

    expect(tutorials[1].members[0]).to.equal(tutorials[2].members[0]);
  });
});
