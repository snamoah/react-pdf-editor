import React from 'react';
import { render, cleanup } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  afterEach(cleanup)

  it('renders App', () => {
    const { getByText } = render(<App />);
    const linkElement = getByText(/PDF Editor/i);
    expect(linkElement).toBeInTheDocument();
  });
})
