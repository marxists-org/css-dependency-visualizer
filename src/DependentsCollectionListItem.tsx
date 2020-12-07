import * as React from "react";
import { ReactComponent as FileIcon } from './file.svg';
import { ReactComponent as FolderIcon } from './folder.svg';

export type Props = {
  color?: string,
  count?: number,
  className?: string|null,
  id: string,
  name: string,
  percent: number,
  type: "DIRECTORY"|"CSS"|"HTML"|"ROOT",
  style?: any,
};

function DependentsCollectionListItem(props: Props) {
  const className = props.className == null
    ? "line-item"
    : `line-item ${props.className} `;

  return (
    <div className={className}
        style={props.style}>
      {props.type === "DIRECTORY" ? <FolderIcon className="line-item_type" /> : <FileIcon className="line-item_type"/>}
      <div className="line-item_name">{props.name}</div>
    </div>
  );
}

export default DependentsCollectionListItem;
