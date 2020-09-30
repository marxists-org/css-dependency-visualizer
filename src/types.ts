export type CliGraph = {
  name: string,
  children: CliGraph[],
}

export namespace Models {
  export type Graph = {
    children: Graph[],
    count: number,
    id: string,
    name: string,
    percent: number,
    type: "ROOT" | "CSS" | "HTML" | "ARCHIVE"
  }
}
