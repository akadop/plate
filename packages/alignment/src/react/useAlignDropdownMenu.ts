import { isDefined } from '@udecode/plate';
import { useEditorRef, useEditorSelector } from '@udecode/plate/react';

import { type Alignment, BaseAlignPlugin, setAlign } from '../index';

export const useAlignDropdownMenuState = () => {
  const value: Alignment = useEditorSelector((editor) => {
    let commonAlignment: string | undefined;
    const codeBlockEntries = editor.api.nodes({
      match: (n) => editor.api.isBlock(n),
    });
    const nodes = Array.from(codeBlockEntries);
    nodes.forEach(([node]) => {
      const align: string = (node[BaseAlignPlugin.key] as string) || 'start';

      if (!isDefined(commonAlignment)) {
        commonAlignment = align;
      } else if (commonAlignment !== align) {
        commonAlignment = undefined;
      }
    });

    if (isDefined(commonAlignment)) {
      const nodeValue = commonAlignment;

      if (nodeValue === 'left') return 'left';
      if (nodeValue === 'center') return 'center';
      if (nodeValue === 'right') return 'right';
      if (nodeValue === 'end') return 'end';
      if (nodeValue === 'justify') return 'justify';
    }

    return 'start';
  }, []);

  return {
    value,
  };
};

export const useAlignDropdownMenu = ({
  value,
}: ReturnType<typeof useAlignDropdownMenuState>) => {
  const editor = useEditorRef();

  return {
    radioGroupProps: {
      value,
      onValueChange: (newValue: string) => {
        setAlign(editor, {
          value: newValue as Alignment,
        });

        editor.tf.focus();
      },
    },
  };
};
