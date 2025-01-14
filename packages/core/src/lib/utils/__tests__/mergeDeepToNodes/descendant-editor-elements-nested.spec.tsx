/** @jsx jsxt */

import { ListItemPlugin } from '@udecode/plate-list/react';
import { jsxt } from '@udecode/plate-test-utils';
import { NodeApi } from '@udecode/slate';

import { BaseParagraphPlugin } from '../../../plugins';
import { mergeDeepToNodes } from '../../../utils';

jsxt;

const node = (
  <editor>
    <hli>
      test
      <hp>test</hp>test
    </hli>
  </editor>
) as any;
const props = { a: 1 };

const output = (
  <editor>
    <element a={1} type={ListItemPlugin.key}>
      <htext a={1}>test</htext>
      <element a={1} type={BaseParagraphPlugin.key}>
        <htext a={1}>test</htext>
      </element>
      <htext a={1}>test</htext>
    </element>
  </editor>
) as any;

it('should set props to all descendants', () => {
  mergeDeepToNodes({
    node,
    query: {
      filter: ([n]) => NodeApi.isDescendant(n),
    },
    source: props,
  });
  expect(node.children).toEqual(output.children);
});