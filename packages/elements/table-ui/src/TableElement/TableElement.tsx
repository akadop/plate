import * as React from 'react';
import { StyledElementProps } from '@udecode/slate-plugins-styled-components';
import { getTableElementStyles } from './TableElement.styles';

export const TableElement = (props: StyledElementProps) => {
  const { attributes, children, nodeProps } = props;

  const { root } = getTableElementStyles(props);

  return (
    <table
      {...attributes}
      css={root.css}
      className={root.className}
      {...nodeProps}
    >
      <tbody>{children}</tbody>
    </table>
  );
};
