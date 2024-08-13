import {
  type PlateEditor,
  type TDescendant,
  applyDeepToNodes,
  nanoid,
  withoutNormalizing,
} from '@udecode/plate-common';

import { KEY_SUGGESTION_ID, SuggestionPlugin } from '../SuggestionPlugin';
import { findSuggestionId } from '../queries/findSuggestionId';
import { getSuggestionKeys } from '../utils/index';
import { deleteFragmentSuggestion } from './deleteFragmentSuggestion';
import { getSuggestionCurrentUserKey } from './getSuggestionProps';

export const insertFragmentSuggestion = (
  editor: PlateEditor,
  fragment: TDescendant[],
  {
    insertFragment = editor.insertFragment,
  }: {
    insertFragment?: (fragment: TDescendant[]) => void;
  } = {}
) => {
  withoutNormalizing(editor, () => {
    deleteFragmentSuggestion(editor);

    const id = findSuggestionId(editor, editor.selection!) ?? nanoid();

    fragment.forEach((node) => {
      applyDeepToNodes({
        apply: (n) => {
          if (!n[SuggestionPlugin.key]) {
            // Add suggestion mark
            n[SuggestionPlugin.key] = true;
          }
          if (n.suggestionDeletion) {
            // Remove suggestion deletion mark
            delete n.suggestionDeletion;
          }

          n[KEY_SUGGESTION_ID] = id;

          // remove the other user keys
          const otherUserKeys = getSuggestionKeys(n);
          otherUserKeys.forEach((key) => {
            delete n[key];
          });

          // set current user key
          n[getSuggestionCurrentUserKey(editor)] = true;
        },
        node,
        source: {},
      });
    });

    insertFragment(fragment);
  });
};
