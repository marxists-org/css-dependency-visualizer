import * as React from "react";

export type Props = {
  color?: string,
  count?: number,
  className?: string|null,
  onClick?: (id: string) => void,
  onMouseEnter?: (id: string) => void,
  onMouseLeave?: (id: string) => void,
  id: string,
  name: string,
  percent: number,
  style?: any,
};

function CollectionListItem(props: Props) {
  const percent = (props.percent * 100).toFixed(2);

  const color = props.color || "black";
  const onClick = () => props.onClick?.(props.id);
  const onMouseEnter = () => props.onMouseEnter?.(props.id);
  const onMouseLeave = () => props.onMouseLeave?.(props.id);
  const itemBarFillStyle = {width: `${percent}%`, backgroundColor: color};
  const style = {backgroundColor: color};

  const className = props.className == null
    ? "line-item"
    : `line-item ${props.className} `;

  return (
    <div className={className}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={props.style}>
      <div className="line-item_color" style={style}></div>
      <div className="line-item_name">{props.name}</div>
      <div className="line-item_bar">
        <div className="bar">
          <div className="bar_fill" style={itemBarFillStyle}></div>
        </div>
      </div>
      <div className="line-item_count">{props.count?.toLocaleString()}</div>
      <div className="line-item_percentage">{percent}%</div>
    </div>
  );
}

export default CollectionListItem;
