import {Models, CliGraph} from './types';

type Graph = Models.Graph;

function firstMatch(match: null|string[]): null|string {
  return match == null ? null : match[1];
}

function uuid(): string {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c: string) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c === 'x' ? r :(r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

function graphFromCliGraph(
    collection:{total: number, nodes: {[key: string]:Graph}},
    next: CliGraph,
    idx: number,
    source: CliGraph[]): {total: number, nodes: {[key: string]:Graph}} {

  let {total, nodes} = collection;

  const name = next.name;
  const type = (name.endsWith(".html") || name.endsWith(".htm"))
    ? "HTML"
    : name.endsWith(".css")
      ? "CSS"
      : "ARCHIVE"
      ;

  const children = next.children.length > 0
    ? next.children.reduce(graphFromCliGraph, {total:0, nodes:{}})
    : {total: 1, nodes: {}};

  nodes[name] = {
    children: [...Object.values(children.nodes)],
    count: children.total,
    id: uuid(),
    name,
    percent: 0.00,
    type,
  };

  total = total + children.total;

  if (idx === source.length - 1) {
    const calculatedCollection = Object.values(nodes)
      .reduce((collection: {[key: string]: Graph}, next: Graph) => {
        const percent = next.count / total;
        collection[next.name] = {...next, percent};
        return collection;
      }, {});
    return {total, nodes: calculatedCollection};
  }
  return {total, nodes};
}

function addArchive(root: CliGraph): CliGraph {
  const queue: CliGraph[] = [];
  queue.push(root);
  while (queue.length > 0) {
    const parent = queue.shift();
    if (parent == null) break;

    let i = 0;
    let newArchiveNodes: {[key:string]: CliGraph[]} = {};
    while (i <= parent.children.length) {
      if (i === parent.children.length) {
        const newEntries = [...Object.entries(newArchiveNodes)];
        if (newEntries.length === 0) {
          break;
        }
        newEntries.forEach(([name, children]) => {
          // console.log(parent, {name, children});
          parent.children.push({name, children});
        });
        newArchiveNodes = {};
        continue;
      }
      const child = parent.children[i];

      const parentArchive = firstMatch(parent.name.match(/archive\/([^/]*)\//));
      const childArchive = firstMatch(child.name.match(/archive\/([^/]*)\//));
      const childIsHtml = child.name.endsWith('.htm') || child.name.endsWith('.html');

      if (childIsHtml && childArchive !== null && childArchive !== parentArchive) {
        const key = `/archive/${childArchive}/`;
        if (newArchiveNodes[key] == null) {
          newArchiveNodes[key] = [];
        }
        newArchiveNodes[key].push(child);
        parent.children.splice(i, 1);
        continue;
      }

      queue.push(child);
      i++;
    }

  }

  return root;
}

function cliGraphToGraph(root: CliGraph): Graph {
  const transformed = [root].reduce(graphFromCliGraph, {total: 0, nodes:{}}).nodes;
  const newRoot = transformed[root.name];
  if (newRoot == null) throw new Error();
  newRoot.type = "ROOT";
  console.log(newRoot);
  return newRoot;
}

function process(root: CliGraph): Graph {
  let newRoot = addArchive(root);
  return cliGraphToGraph(newRoot);
}

class DataStore {
  private data: null|Graph = null;
  private nodesById: {[key:string]: Graph} = {};

  async get(): Promise<Graph> {
    if (this.data !== null) {
      return this.data;
    }

    try {
      const fetchedData = await (await fetch("formatted.json")).json();
      this.data = process(fetchedData);
      this.index();
      return this.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  private index() {
    if (this.data == null) return;
    const queue = [this.data];
    while (queue.length > 0) {
      const node = queue.shift();
      if (node == null) break;
      this.nodesById[node.id] = node;
      for (let child of node.children) {
        queue.push(child);
      }
    }
  }

  findById(id: string): Graph|undefined {
    return this.nodesById[id];
  }
}

export default DataStore;
