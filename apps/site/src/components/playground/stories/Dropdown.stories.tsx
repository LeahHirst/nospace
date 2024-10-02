import type { Meta, StoryObj } from '@storybook/react';

import Dropdown, { DropdownAction } from '../Dropdown';

function WrappedDropdown() {
  return (
    <div style={{ backgroundColor: 'black' }}>
      <Dropdown label="Insert">
        <DropdownAction>ZWSP</DropdownAction>
        <DropdownAction>ZWNJ</DropdownAction>
        <DropdownAction>ZWJ</DropdownAction>
        <DropdownAction>WJ</DropdownAction>
      </Dropdown>
    </div>
  );
}

const meta = {
  title: 'Playground/Dropdown',
  component: WrappedDropdown,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: { label: 'Insert' },
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
};
