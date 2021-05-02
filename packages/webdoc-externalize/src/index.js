import write, {fromTree} from "./write";
import read from "./read";

export default {
  fromTree,
  readDoctree: read,
  read,
  writeDoctree: write,
  write,
};

export {
  fromTree,
  read,
  read as readDoctree,
  write,
  write as writeDoctree,
};
