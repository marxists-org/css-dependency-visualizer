import {Entry} from './types';

const sortKeys = {
  ROOT: 0,
  DIRECTORY: 1,
  HTML: 2,
  CSS: 3,
};

export function sortCombinedNodes(a_:Entry[], b_:Entry[]) {
  const a = a_[a_.length - 1];
  const b = b_[b_.length - 1];
  if (a.type === b.type) {
    return (b.dependentsCount.indirect + b.dependentsCount.direct) - (a.dependentsCount.indirect + a.dependentsCount.direct);
  } else {
    return sortKeys[a.type] - sortKeys[b.type];
  }
}

export function selectEntries(data: Map<string, Entry>, ids: string[]): Array<Entry[]> {
  const nodes = ids.map(id => data.get(id)).filter(node => node != null) as Entry[];
  const combinedNodes = nodes.map(entry => mapToCombinedNodes(data, entry));
  return combinedNodes.sort(sortCombinedNodes);
}

export function mapToCombinedNodes(data: Map<string, Entry>, node: Entry): Entry[] {
  const combinedNodes: Entry[] = [node];

  if (node.type === "DIRECTORY" && node.dependents.length === 1) {
    const queue:Array<Entry> = [data.get(node.dependents[0]) as Entry];
    while (queue.length > 0) {
      let node = queue.shift() as Entry;
      combinedNodes.push(node);
      if (node.type === "DIRECTORY" && node.dependents.length === 1) {
        queue.push(data.get(node.dependents[0]) as Entry);
      }
    }
  }

  return combinedNodes;
}
