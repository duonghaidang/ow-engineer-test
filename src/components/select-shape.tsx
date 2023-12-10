import React, { memo, useCallback } from "react";

export interface SelectData {
  id: string;
  icon?: string;
  label?: string;
}

interface SelectShapeProps {
  data: SelectData[];
  className?: string;
  value?: string;
  onSelectItem?: (item: SelectData) => void;
}

function SelectShape(props: SelectShapeProps) {
  const { data, className, value, onSelectItem } = props;

  const renderSelect = useCallback(
    (item: SelectData, index: number) => {
      const isSelected = value === item.id;
      return (
        <button
          onClick={() => {
            onSelectItem?.(item);
          }}
          key={index}
          className={`w-[30%] p-2 border-2 rounded-lg flex flex-col items-center ${
            isSelected && "border-blue-800"
          }`}
        >
          <p className="font-semibold text-sm text-black/70">{item.label}</p>
        </button>
      );
    },
    [onSelectItem, value]
  );

  return (
    <div className={`flex justify-between flex-wrap ${className}`}>
      {data.map(renderSelect)}
    </div>
  );
}

export default memo(SelectShape);
