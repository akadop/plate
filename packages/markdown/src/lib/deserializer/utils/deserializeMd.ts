import type { SlateEditor } from '@udecode/plate';

import remarkParse from 'remark-parse';
import { type Plugin, type Processor, unified } from 'unified';

import { MarkdownPlugin } from '../../MarkdownPlugin';
import {
  type RemarkElementRules,
  type RemarkPluginOptions,
  type RemarkTextRules,
  getRemarkDefaultElementRules,
  remarkPlugin,
} from '../../remark-slate';
import {
  type ParseMarkdownBlocksOptions,
  parseMarkdownBlocks,
} from './parseMarkdownBlocks';

export type DeserializeMdOptions = {
  /** Whether to add _memo property to elements */
  memoize?: boolean;
  /** Options for the token parser */
  parser?: ParseMarkdownBlocksOptions;
  /** A function that allows you to modify the markdown processor. */
  processor?: (processor: Processor) => Processor;
};

/** Deserialize content from Markdown format to Slate format. */
export const deserializeMd = (
  editor: SlateEditor,
  data: string,
  { memoize, parser, processor }: DeserializeMdOptions = {}
) => {
  const elementRules: RemarkElementRules = getRemarkDefaultElementRules(editor);
  const textRules: RemarkTextRules = {};

  const options = editor.getOptions(MarkdownPlugin);

  Object.assign(textRules, options.textRules);

  const remarkPlugins: Plugin[] =
    editor.getOptions(MarkdownPlugin).remarkPlugins;

  let tree: any = unified().use(remarkPlugins).use(remarkParse);

  if (processor) {
    tree = processor(tree);
  }

  tree = tree.use(remarkPlugin, {
    editor,
    elementRules,
    indentList: editor.pluginList.some(
      (plugin) => plugin.key === 'listStyleType'
    ),
    textRules,
  } as unknown as RemarkPluginOptions);

  if (memoize) {
    return parseMarkdownBlocks(data, parser).flatMap((token) => {
      if (token.type === 'space') {
        return {
          ...editor.api.create.block(),
          _memo: token.raw,
        };
      }

      // TODO: split list items
      return tree.processSync(token.raw).result.map((result: any) => {
        return {
          _memo: token.raw,
          ...result,
        };
      });
    });
  }

  return tree.processSync(data).result;
};

// TODO: Collect rules from plugins
// editor.plugins.forEach((plugin: SlatePlugin) => {
//   if (plugin.parsers?.markdown?.deserialize) {
//     const { elementRules: pluginElementRules, textRules: pluginTextRules } =
//       plugin.parsers.markdown.deserialize as MarkdownDeserializer;
//
//     if (pluginElementRules) {
//       Object.assign(elementRules, pluginElementRules);
//     }
//     if (pluginTextRules) {
//       Object.assign(textRules, pluginTextRules);
//     }
//   }
// });
