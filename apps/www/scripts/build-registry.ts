// @ts-nocheck

import fs from 'node:fs';
import path from 'node:path';
import template from 'lodash.template';
import { rimraf } from 'rimraf';

import { colorMapping, colors } from '../src/registry/colors';
import { registry } from '../src/registry/registry';
import { registrySchema } from '../src/registry/schema';
import { styles } from '../src/registry/styles';
import { themes } from '../src/registry/themes';

const REGISTRY_PATH = path.join(process.cwd(), 'public/registry');

const result = registrySchema.safeParse(registry);

if (!result.success) {
  console.error((result as any).error);
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
}

// ----------------------------------------------------------------------------
// Build __registry__/index.tsx.
// ----------------------------------------------------------------------------
let index = `// @ts-nocheck
// This file is autogenerated by scripts/build-registry.ts
// Do not edit this file directly.
import * as React from 'react'
export const Index: Record<string, any> = {
`;

for (const style of styles) {
  index += `  '${style.name}': {`;

  // Build style index.
  for (const item of result.data) {
    // if (item.type === "components:plate-ui") {
    //   continue
    // }

    const resolveFiles = item.files.map((file) =>
      item.external ? `${file}` : `registry/${style.name}/${file}`
    );

    const type = item.type.split(':')[1];

    const importPath = item.external
      ? `@/${item.files[0]}`
      : `@/registry/${style.name}/${type}/${item.name}`;

    index += `
    '${item.name}': {
      name: '${item.name}',
      type: '${item.type}',
      registryDependencies: ${JSON.stringify(item.registryDependencies ?? [])},
      ${
        item.items
          ? `items: [${item.items.map((i) => `'${i}'`)}],`
          : `files: [${resolveFiles.map((file) => `'${file}'`)}],`
      }${
        item.items
          ? ''
          : `
      component: React.lazy(() => import('${importPath}')),`
      }
    },`;

    if (item.files.length > 1) {
      // If 'items' is defined
      // @ts-ignore
      for (const [subIndex, subItem] of item.files.entries()) {
        if (subIndex === 0) continue;

        const file = path.basename(subItem);

        const subName = file.slice(0, Math.max(0, file.indexOf('.')));
        const ext = file.slice(Math.max(file.indexOf('.'), -1));
        if (['.ts', '.tsx'].includes(ext)) {
          index += `
    '${subName}': {
      name: '${subName}',
      type: '${item.type}',
      registryDependencies: ${JSON.stringify(item.registryDependencies)},
      files: ['${resolveFiles[subIndex]}'],
      component: React.lazy(() => import('@/registry/${
        style.name
      }/${type}/${subName}')),
    },`;
        }
      }
    }
  }

  index += `
  },`;
}

index += `
}
`;

// Write style index.
const indexPath = path.join(process.cwd(), 'src/__registry__/index.tsx');

const writeFile: typeof fs.writeFileSync = (filePath, ...args) => {
  const dirPath = path.dirname(filePath as string);

  rimraf.sync(filePath as string);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  fs.writeFileSync(filePath, ...args);
};

writeFile(indexPath, index);

// ----------------------------------------------------------------------------
// Build registry/styles/[style]/[name].json.
// ----------------------------------------------------------------------------
for (const style of styles) {
  const targetPath = path.join(REGISTRY_PATH, 'styles', style.name);

  for (const item of result.data) {
    if (item.type !== 'components:plate-ui') {
      continue;
    }

    const files = item.files?.map((file) => {
      const content = fs.readFileSync(
        path.join(process.cwd(), 'src/registry', style.name, file),
        'utf8'
      );

      return {
        name: path.basename(file),
        content,
      };
    });

    const payload = {
      ...item,
      files,
    };

    writeFile(
      path.join(targetPath, `${item.name}.json`),
      JSON.stringify(payload, null, 2),
      'utf8'
    );
  }
}

// ----------------------------------------------------------------------------
// Build registry/styles/index.json.
// ----------------------------------------------------------------------------
const stylesJson = JSON.stringify(styles, null, 2);
writeFile(path.join(REGISTRY_PATH, 'styles/index.json'), stylesJson, 'utf8');

// ----------------------------------------------------------------------------
// Build registry/index.json.
// ----------------------------------------------------------------------------
const names = result.data.filter((item) => item.type === 'components:plate-ui');
const registryJson = JSON.stringify(names, null, 2);
writeFile(path.join(REGISTRY_PATH, 'index.json'), registryJson, 'utf8');

// ----------------------------------------------------------------------------
// Build registry/colors/index.json.
// ----------------------------------------------------------------------------
const colorsTargetPath = path.join(REGISTRY_PATH, 'colors');

const colorsData: Record<string, any> = {};
for (const [color, value] of Object.entries(colors)) {
  if (typeof value === 'string') {
    colorsData[color] = value;
    continue;
  }

  if (Array.isArray(value)) {
    colorsData[color] = value.map((item) => ({
      ...item,
      rgbChannel: item.rgb.replace(/^rgb\((\d+),(\d+),(\d+)\)$/, '$1 $2 $3'),
      hslChannel: item.hsl.replace(
        /^hsl\(([\d.]+),([\d.]+%),([\d.]+%)\)$/,
        '$1 $2 $3'
      ),
    }));
    continue;
  }

  if (typeof value === 'object') {
    colorsData[color] = {
      ...value,
      rgbChannel: value.rgb.replace(/^rgb\((\d+),(\d+),(\d+)\)$/, '$1 $2 $3'),
      hslChannel: value.hsl.replace(
        /^hsl\(([\d.]+),([\d.]+%),([\d.]+%)\)$/,
        '$1 $2 $3'
      ),
    };
    continue;
  }
}

writeFile(
  path.join(colorsTargetPath, 'index.json'),
  JSON.stringify(colorsData, null, 2),
  'utf8'
);

// ----------------------------------------------------------------------------
// Build registry/colors/[base].json.
// ----------------------------------------------------------------------------
export const BASE_STYLES = `@tailwind base;
@tailwind components;
@tailwind utilities;
`;

export const BASE_STYLES_WITH_VARIABLES = `@tailwind base;
@tailwind components;
@tailwind utilities;
 
@layer base {
  :root {
    --background: <%- colors.light["background"] %>;
    --foreground: <%- colors.light["foreground"] %>;
 
    --muted: <%- colors.light["muted"] %>;
    --muted-foreground: <%- colors.light["muted-foreground"] %>;
 
    --popover: <%- colors.light["popover"] %>;
    --popover-foreground: <%- colors.light["popover-foreground"] %>;
 
    --card: <%- colors.light["card"] %>;
    --card-foreground: <%- colors.light["card-foreground"] %>;
 
    --border: <%- colors.light["border"] %>;
    --input: <%- colors.light["input"] %>;
 
    --primary: <%- colors.light["primary"] %>;
    --primary-foreground: <%- colors.light["primary-foreground"] %>;
 
    --secondary: <%- colors.light["secondary"] %>;
    --secondary-foreground: <%- colors.light["secondary-foreground"] %>;
 
    --accent: <%- colors.light["accent"] %>;
    --accent-foreground: <%- colors.light["accent-foreground"] %>;
 
    --destructive: <%- colors.light["destructive"] %>;
    --destructive-foreground: <%- colors.light["destructive-foreground"] %>;
 
    --ring: <%- colors.light["ring"] %>;
 
    --radius: 0.5rem;
  }
 
  .dark {
    --background: <%- colors.dark["background"] %>;
    --foreground: <%- colors.dark["foreground"] %>;
 
    --muted: <%- colors.dark["muted"] %>;
    --muted-foreground: <%- colors.dark["muted-foreground"] %>;
 
    --popover: <%- colors.dark["popover"] %>;
    --popover-foreground: <%- colors.dark["popover-foreground"] %>;
 
    --card: <%- colors.dark["card"] %>;
    --card-foreground: <%- colors.dark["card-foreground"] %>;
 
    --border: <%- colors.dark["border"] %>;
    --input: <%- colors.dark["input"] %>;
 
    --primary: <%- colors.dark["primary"] %>;
    --primary-foreground: <%- colors.dark["primary-foreground"] %>;
 
    --secondary: <%- colors.dark["secondary"] %>;
    --secondary-foreground: <%- colors.dark["secondary-foreground"] %>;
 
    --accent: <%- colors.dark["accent"] %>;
    --accent-foreground: <%- colors.dark["accent-foreground"] %>;
 
    --destructive: <%- colors.dark["destructive"] %>;
    --destructive-foreground: <%- colors.dark["destructive-foreground"] %>;
 
    --ring: <%- colors.dark["ring"] %>;
  }
}
 
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`;

for (const baseColor of ['slate', 'gray', 'zinc', 'neutral', 'stone', 'lime']) {
  const base: Record<string, any> = {
    inlineColors: {},
    cssVars: {},
  };
  for (const [mode, values] of Object.entries(colorMapping)) {
    base['inlineColors'][mode] = {};
    base['cssVars'][mode] = {};
    for (const [key, value] of Object.entries(values)) {
      if (typeof value === 'string') {
        const resolvedColor = (value as any).replaceAll(
          '{{base}}-',
          `${baseColor}-`
        );
        base['inlineColors'][mode][key] = resolvedColor;

        const [resolvedBase, scale] = resolvedColor.split('-');
        const color = scale
          ? colorsData[resolvedBase].find(
              (item) => item.scale === Number.parseInt(scale)
            )
          : colorsData[resolvedBase];
        if (color) {
          base['cssVars'][mode][key] = color.hslChannel;
        }
      }
    }
  }

  // Build css vars.
  base['inlineColorsTemplate'] = template(BASE_STYLES)({});
  base['cssVarsTemplate'] = template(BASE_STYLES_WITH_VARIABLES)({
    colors: base['cssVars'],
  });

  writeFile(
    path.join(REGISTRY_PATH, `colors/${baseColor}.json`),
    JSON.stringify(base, null, 2),
    'utf8'
  );
}

// ----------------------------------------------------------------------------
// Build registry/themes.css
// ----------------------------------------------------------------------------
export const THEME_STYLES_WITH_VARIABLES = `
  .theme-<%- theme %> {
    --background: <%- colors.light["background"] %>;
    --foreground: <%- colors.light["foreground"] %>;
 
    --muted: <%- colors.light["muted"] %>;
    --muted-foreground: <%- colors.light["muted-foreground"] %>;
 
    --popover: <%- colors.light["popover"] %>;
    --popover-foreground: <%- colors.light["popover-foreground"] %>;
 
    --card: <%- colors.light["card"] %>;
    --card-foreground: <%- colors.light["card-foreground"] %>;
 
    --border: <%- colors.light["border"] %>;
    --input: <%- colors.light["input"] %>;
 
    --primary: <%- colors.light["primary"] %>;
    --primary-foreground: <%- colors.light["primary-foreground"] %>;
 
    --secondary: <%- colors.light["secondary"] %>;
    --secondary-foreground: <%- colors.light["secondary-foreground"] %>;
 
    --accent: <%- colors.light["accent"] %>;
    --accent-foreground: <%- colors.light["accent-foreground"] %>;
 
    --destructive: <%- colors.light["destructive"] %>;
    --destructive-foreground: <%- colors.light["destructive-foreground"] %>;
 
    --ring: <%- colors.light["ring"] %>;
 
    --radius: 0.5rem;
  }
 
  .dark .theme-<%- theme %> {
    --background: <%- colors.dark["background"] %>;
    --foreground: <%- colors.dark["foreground"] %>;
 
    --muted: <%- colors.dark["muted"] %>;
    --muted-foreground: <%- colors.dark["muted-foreground"] %>;
 
    --popover: <%- colors.dark["popover"] %>;
    --popover-foreground: <%- colors.dark["popover-foreground"] %>;
 
    --card: <%- colors.dark["card"] %>;
    --card-foreground: <%- colors.dark["card-foreground"] %>;
 
    --border: <%- colors.dark["border"] %>;
    --input: <%- colors.dark["input"] %>;
 
    --primary: <%- colors.dark["primary"] %>;
    --primary-foreground: <%- colors.dark["primary-foreground"] %>;
 
    --secondary: <%- colors.dark["secondary"] %>;
    --secondary-foreground: <%- colors.dark["secondary-foreground"] %>;
 
    --accent: <%- colors.dark["accent"] %>;
    --accent-foreground: <%- colors.dark["accent-foreground"] %>;
 
    --destructive: <%- colors.dark["destructive"] %>;
    --destructive-foreground: <%- colors.dark["destructive-foreground"] %>;
 
    --ring: <%- colors.dark["ring"] %>;
  }`;

const themeCSS = [];
for (const theme of themes) {
  themeCSS.push(
    template(THEME_STYLES_WITH_VARIABLES)({
      colors: theme.cssVars,
      theme: theme.name,
    })
  );
}

writeFile(path.join(REGISTRY_PATH, `themes.css`), themeCSS.join('\n'), 'utf8');

console.info('✅ Done!');