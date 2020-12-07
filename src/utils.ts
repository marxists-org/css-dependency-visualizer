import {Entry} from './types';

const sortKeys = {
  ROOT: 0,
  DIRECTORY: 1,
  CSS: 2,
  HTML: 3,
};

export function sortCombinedNodes(a_:Entry[], b_:Entry[]) {
  const a = a_[a_.length - 1];
  const b = b_[b_.length - 1];
  return sortNodes(a, b);
}

export function sortNodes(a:Entry, b:Entry) {
  if (a.type === b.type) {
    return (b.dependentsCount.indirect + b.dependentsCount.direct) - (a.dependentsCount.indirect + a.dependentsCount.direct);
  } else {
    return sortKeys[a.type] - sortKeys[b.type];
  }
}

export function selectCssEntries(data: Map<string, Entry>, ids: string[], deep: boolean): Array<Entry> {
  const nodes = ids.map(id => data.get(id)).filter(node => node != null) as Entry[];
  return nodes.flatMap(entry => {
    if (entry.type === "CSS") return [entry];
    const collected: Entry[] = [];
    const queue: string[] = [...entry.dependents];
    while (queue.length > 0) {
      const id = queue.shift()!;
      const node = data.get(id)!;
      if (node.type === "CSS") {
        collected.push(node);
        if (deep) queue.push(...node.dependents);
      } else if (node.type === "DIRECTORY") {
        queue.push(...node.dependents);
      }
    }
    return collected;
  }).sort((a,b) => a.path.localeCompare(b.path));
}

export function selectHtmlEntries(data: Map<string, Entry>, ids: string[], deep: boolean): Array<Entry> {
  const nodes = ids.map(id => data.get(id)).filter(node => node != null) as Entry[];
  return nodes.flatMap(entry => {
    if (entry.type === "HTML") return [entry];
    const collected: Entry[] = [];
    const queue: string[] = [...entry.dependents];
    while (queue.length > 0) {
      const id = queue.shift()!;
      const node = data.get(id)!;
      if (node.type === "HTML") {
        collected.push(node);
      } else if (node.type === "CSS") {
        collected.push(node);
        if (deep) queue.push(...node.dependents);
      } else {
        queue.push(...node.dependents);
      }
    }
    return collected;
  }).sort(sortNodes);
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
