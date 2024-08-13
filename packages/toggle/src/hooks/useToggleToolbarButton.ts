import { collapseSelection, toggleNodeType } from '@udecode/plate-common';
import {
  focusEditor,
  useEditorRef,
  useEditorSelector,
} from '@udecode/plate-common/react';

import { TogglePlugin } from '../TogglePlugin';
import { someToggle } from '../queries/someToggle';
import { openNextToggles } from '../transforms';

export const useToggleToolbarButtonState = () => {
  const pressed = useEditorSelector((editor) => someToggle(editor), []);

  return {
    pressed,
  };
};

export const useToggleToolbarButton = ({
  pressed,
}: ReturnType<typeof useToggleToolbarButtonState>) => {
  const editor = useEditorRef();

  return {
    props: {
      onClick: () => {
        openNextToggles(editor);
        toggleNodeType(editor, { activeType: TogglePlugin.key });
        collapseSelection(editor);
        focusEditor(editor);
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
      pressed,
    },
  };
};
