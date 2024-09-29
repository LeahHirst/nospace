import React from 'react';
import { Global, css } from "@emotion/react";
import type { Preview } from "@storybook/react";

export const decorators = [
  (Story) => (
    <>
      <Global
        styles={css`
          body, button, input, textarea {
            font-family: -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif;
          }
        `}
      />
      <Story />
    </>
  )
]

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
