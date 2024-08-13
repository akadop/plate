import React from 'react';

import { getPluginOptions, unsetNodes } from '@udecode/plate-common';
import { findNodePath, useEditorRef } from '@udecode/plate-common/react';

import type { TTableElement, TablePluginOptions } from '../../types';

import { TablePlugin } from '../../TablePlugin';
import {
  getTableColumnCount,
  getTableOverriddenColSizes,
} from '../../queries/index';
import { useTableStore } from '../../stores/tableStore';

/**
 * Returns colSizes with overrides applied. Unset node.colSizes if `colCount`
 * updates to 1.
 */
export const useTableColSizes = (
  tableNode: TTableElement,
  { disableOverrides = false } = {}
): number[] => {
  const editor = useEditorRef();
  const colSizeOverrides = useTableStore().get.colSizeOverrides();

  const { enableUnsetSingleColSize } = getPluginOptions<TablePluginOptions>(
    editor,
    TablePlugin.key
  );

  const overriddenColSizes = getTableOverriddenColSizes(
    tableNode,
    disableOverrides ? undefined : colSizeOverrides
  );

  const colCount = getTableColumnCount(tableNode);

  React.useEffect(() => {
    if (
      enableUnsetSingleColSize &&
      colCount < 2 &&
      tableNode.colSizes?.length
    ) {
      unsetNodes(editor, 'colSizes', {
        at: findNodePath(editor, tableNode),
      });
    }
  }, [colCount, enableUnsetSingleColSize, editor, tableNode]);

  return overriddenColSizes;
};
