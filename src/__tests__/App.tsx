import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

const generateFile = () => 
  new File(['Hello world'], 'test.pdf', {
    type: 'application/pdf'
  });

describe('App', () => {
  it('renders App', () => {
    const { getByText } = render(<App />);
    const linkElement = getByText(/PDF Editor/i);
    expect(linkElement).toBeInTheDocument();
  });

  describe('Help', () => {
    it('should show FAQ modal when the help menu link is clicked', () => {
      const { getByTestId } = render(<App />);
      const helpMenuItem = getByTestId('help-menu-item');
      fireEvent.click(helpMenuItem);
      expect(getByTestId('help-modal')).toBeInTheDocument();
    });

    it('should close modal when user clicks outside of modal', () => {
      const { getByTestId } = render(<App />);
      const helpMenuItem = getByTestId('help-menu-item');
      fireEvent.click(helpMenuItem);
      
      const helpModal = getByTestId('help-modal');
      expect(helpModal).toBeInTheDocument();

      const dimmer = document.getElementsByClassName('page modals dimmer')[0];
      fireEvent.click(dimmer);
      expect(helpModal).not.toBeInTheDocument();
    });
  });

  describe('Menubar', () => {
    it('should not show edit menu items for empty screen', () => {
      const { getByTestId } = render(<App />);

      expect(() => getByTestId('edit-menu-dropdown')).toThrow();
      expect(() => getByTestId('save-menu-item')).toThrow();
      expect(() => getByTestId('upload-menu-item')).toThrow();
    });
  });
})
