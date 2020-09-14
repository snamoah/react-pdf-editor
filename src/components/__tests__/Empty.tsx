import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { Empty } from '../Empty';

describe('Empty Component', () => {

    afterEach(cleanup);

    it('should render upload pdf button', () => {
        const uploadPdf = jest.fn();
        const { getByText } = render(<Empty loading={false} uploadPdf={uploadPdf} />);
        const buttonElement = getByText('Load PDF');
        expect(buttonElement).toBeInTheDocument();
    });

    it('should call uploadPdf when button is clicked',() => {
        const uploadPdf = jest.fn();
        const { getByText } = render(<Empty loading={false} uploadPdf={uploadPdf} />);
        const buttonElement = getByText('Load PDF');
        fireEvent.click(buttonElement);
        expect(uploadPdf).toBeCalled();
    });

    it('should have loading class set when loading prop is true', () => {
        const uploadPdf = jest.fn();
        const { getByTestId } = render(<Empty loading={true} uploadPdf={uploadPdf} />);
        const segmentElement = getByTestId('empty-container');
        expect(segmentElement.classList).toContain('loading')
    });

    it('should not loader when loading prop is false', () => {
        const uploadPdf = jest.fn();
        const { getByTestId } = render(<Empty loading={false} uploadPdf={uploadPdf} />);
        const segmentElement = getByTestId('empty-container');
        expect(segmentElement.classList).not.toContain('loading');
    });
});
