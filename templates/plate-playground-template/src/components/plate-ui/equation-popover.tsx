'use client';

import React, { useEffect } from 'react';
import TextareaAutosize, {
  type TextareaAutosizeProps,
} from 'react-textarea-autosize';

import type { TEquationElement } from '@udecode/plate-math';

import { cn } from '@udecode/cn';
import {
  createPrimitiveComponent,
  selectSiblingNodePoint,
  useEditorRef,
  useElement,
} from '@udecode/plate-common/react';
import { useEquationInput } from '@udecode/plate-math/react';
import { BlockSelectionPlugin } from '@udecode/plate-selection/react';
import { CornerDownLeftIcon } from 'lucide-react';
import { useReadOnly, useSelected } from 'slate-react';

import { Button } from './button';
import { PopoverContent } from './popover';

const EquationInput = createPrimitiveComponent(TextareaAutosize)({
  propsHook: useEquationInput,
});

const EquationPopoverContent = ({
  className,
  isInline,
  open,
  setOpen,
  ...props
}: {
  isInline: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
} & TextareaAutosizeProps) => {
  const editor = useEditorRef();
  const readOnly = useReadOnly();
  const element = useElement<TEquationElement>();
  const selected = useSelected();

  useEffect(() => {
    if (isInline && selected) {
      setOpen(true);
    }
  }, [selected, isInline, setOpen]);

  if (readOnly) return null;

  const onClose = () => {
    setOpen(false);

    if (isInline) {
      selectSiblingNodePoint(editor, { node: element });
    } else {
      editor
        .getApi(BlockSelectionPlugin)
        .blockSelection.addSelectedRow(element.id as string);
    }
  };

  return (
    <PopoverContent
      className="flex gap-2"
      onEscapeKeyDown={(e) => {
        e.preventDefault();
      }}
      contentEditable={false}
    >
      <EquationInput
        className={cn('max-h-[50vh] grow resize-none p-2 text-sm', className)}
        state={{ isInline, open, onClose }}
        autoFocus
        {...props}
      />

      <Button variant="secondary" className="px-3" onClick={onClose}>
        Done <CornerDownLeftIcon className="size-3.5" />
      </Button>
    </PopoverContent>
  );
};

export { EquationPopoverContent };