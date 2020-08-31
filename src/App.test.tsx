import React from 'react';
import { render } from '@testing-library/react';
import App from './App_backup';

test('renders learn react link', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/PDF Editor/i);
  expect(linkElement).toBeInTheDocument();
});
