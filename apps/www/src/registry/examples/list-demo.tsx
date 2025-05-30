'use client';

import * as React from 'react';

import { withProps } from '@udecode/cn';
import {
  BulletedListPlugin,
  ListItemPlugin,
  ListPlugin,
  NumberedListPlugin,
  TodoListPlugin,
} from '@udecode/plate-list/react';
import { Plate, PlateElement } from '@udecode/plate/react';

import { autoformatListPlugin } from '@/registry/components/editor/plugins/autoformat-list-plugin';
import { editorPlugins } from '@/registry/components/editor/plugins/editor-plugins';
import { FixedToolbarListPlugin } from '@/registry/components/editor/plugins/fixed-toolbar-list-plugin';
import { useCreateEditor } from '@/registry/components/editor/use-create-editor';
import { listValue } from '@/registry/examples/values/list-value';
import { Editor, EditorContainer } from '@/registry/ui/editor';
import { ListElement } from '@/registry/ui/list-element';
import { TodoListElement } from '@/registry/ui/todo-list-element';

export default function ListDemo() {
  const editor = useCreateEditor({
    components: {
      [BulletedListPlugin.key]: withProps(ListElement, { variant: 'ul' }),
      [ListItemPlugin.key]: withProps(PlateElement, { as: 'li' }),
      [NumberedListPlugin.key]: withProps(ListElement, { variant: 'ol' }),
      [TodoListPlugin.key]: TodoListElement,
    },
    plugins: [
      ...editorPlugins,
      ListPlugin,
      TodoListPlugin,
      FixedToolbarListPlugin,
      autoformatListPlugin,
    ],
    value: listValue,
  });

  return (
    <Plate editor={editor}>
      <EditorContainer variant="demo">
        <Editor />
      </EditorContainer>
    </Plate>
  );
}
