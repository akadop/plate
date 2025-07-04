import {
  type SetNodesOptions,
  type SlateEditor,
  type TInlineSuggestionData,
  type TSuggestionText,
  ElementApi,
  getAt,
  KEYS,
  nanoid,
} from 'platejs';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { getSuggestionKey } from '../utils';

export const setSuggestionNodes = (
  editor: SlateEditor,
  options?: {
    createdAt?: number;
    suggestionDeletion?: boolean;
    suggestionId?: string;
  } & SetNodesOptions
) => {
  const at = getAt(editor, options?.at) ?? editor.selection;

  if (!at) return;

  const { suggestionId = nanoid() } = options ?? {};

  // TODO: get all inline nodes to be set
  const _nodeEntries = editor.api.nodes({
    match: (n) => ElementApi.isElement(n) && editor.api.isInline(n),
    ...options,
  });
  const nodeEntries = [..._nodeEntries];

  editor.tf.withoutNormalizing(() => {
    const data: TInlineSuggestionData = {
      id: suggestionId,
      createdAt: options?.createdAt ?? Date.now(),
      type: 'remove',
      userId: editor.getOptions(BaseSuggestionPlugin).currentUserId!,
    };

    const props = {
      [getSuggestionKey(suggestionId)]: data,
      [KEYS.suggestion]: true,
    };

    editor.tf.setNodes(props, {
      at,
      marks: true,
    });

    nodeEntries.forEach(([, path]) => {
      editor.tf.setNodes<TSuggestionText>(props, {
        at: path,
        match: (n) => ElementApi.isElement(n) && editor.api.isInline(n),
        ...options,
      });
    });
  });
};
