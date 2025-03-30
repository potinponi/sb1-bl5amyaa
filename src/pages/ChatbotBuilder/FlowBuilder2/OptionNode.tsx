import React from 'react';
import Draggable from 'react-draggable';
import { Settings, X } from 'lucide-react';
import type { Option, Theme } from '../../../types';
import { QuestionList } from './QuestionList';

interface OptionNodeProps {
  nodeRef: React.RefObject<HTMLDivElement>;
  position: { x: number; y: number };
  onDrag: (e: any, data: { x: number; y: number }) => void;
  option: Option;
  index: number;
  options: Option[];
  setOptions: (options: Option[]) => void;
  theme: Theme;
}

export function OptionNode({
  nodeRef,
  position,
  onDrag,
  option,
  index,
  options,
  setOptions,
  theme
}: OptionNodeProps) {
  return (
    <Draggable
      nodeRef={nodeRef}
      position={position}
      onDrag={onDrag}
      bounds="parent"
      handle=".drag-handle"
    >
      <div
        ref={nodeRef}
        className="flow-node absolute w-80 bg-dark-800 rounded-lg shadow-lg border border-gray-800"
      >
        <div className="p-4 flex items-center justify-between drag-handle cursor-move">
          <div className="flex items-center space-x-3">
            <Settings className="w-5 h-5 text-brand" />
            <input
              type="text"
              value={option.label}
              onChange={(e) => {
                const newOptions = [...options];
                newOptions[index] = {
                  ...option,
                  label: e.target.value
                };
                setOptions(newOptions);
              }}
              className="font-medium text-gray-100 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-brand rounded px-1"
            />
          </div>
          <span className="text-xs text-gray-500">Option {index + 1}</span>
        </div>
        <div className="p-4 border-t border-gray-700">
          <QuestionList
            option={option}
            index={index}
            options={options}
            setOptions={setOptions}
          />
        </div>
      </div>
    </Draggable>
  );
}