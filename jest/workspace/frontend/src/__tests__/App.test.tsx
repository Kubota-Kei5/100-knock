import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders Jest Practice heading', () => {
  render(<App />);
  const linkElement = screen.getByText(/Jest Practice - Frontend/i);
  expect(linkElement).toBeInTheDocument();
});