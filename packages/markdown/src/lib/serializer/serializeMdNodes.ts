import type { Descendant, TElement } from '@udecode/plate';

import merge from 'lodash/merge.js';

import type { MdNodeTypes } from './types';

import { defaultSerializeMdNodesOptions } from './defaultSerializeMdNodesOptions';
import {
  type SerializeMdNodeOptions,
  type SerializeMdOptions,
  serializeMdNode,
} from './serializeMdNode';

/** Convert Slate nodes to Markdown. */
export const serializeMdNodes = (
  nodes: Descendant[],
  options: Partial<
    {
      customNodes?: Partial<Record<string, Partial<SerializeMdNodeOptions>>>;
      nodes?: Partial<
        Record<keyof MdNodeTypes, Partial<SerializeMdNodeOptions>>
      >;
    } & Omit<SerializeMdOptions, 'customNodes' | 'nodes'>
  > = {}
) => {
  Object.keys(options.customNodes || {}).forEach((key) => {
    if ((options.customNodes as any)[key]) {
      if (!(options.customNodes as any)[key].type) {
        (options.customNodes as any)[key].type = key;
      }
    } else {
      (options.customNodes as any)[key] = { type: key };
    }
  });

  const optionsNodes: SerializeMdOptions['nodes'] = merge(
    defaultSerializeMdNodesOptions,
    options.nodes
  );

  // If empty value, return empty string
  if (
    !nodes ||
    nodes.length === 0 ||
    (nodes.length === 1 &&
      nodes[0].type === optionsNodes.p.type &&
      (nodes[0] as TElement).children.length === 1 &&
      (nodes[0].children as Descendant[])[0].text === '')
  ) {
    return '';
  }

  return nodes
    ?.map((v) =>
      serializeMdNode(v, {
        ...options,
        customNodes: options.customNodes as any,
        nodes: optionsNodes,
      })
    )
    .join('')
    .trim();
};
