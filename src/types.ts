export type Entry = {
  dependents: string[],
  dependentsCount: {
    direct: number,
    indirect: number,
  },
  id: string
  imports: string[],
  name: string,
  path: string,
  type: "DIRECTORY"|"CSS"|"HTML"|"ROOT",
}
