import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FollowUpEvaluation from '../features/experience/components/FollowUpEvaluation';

const mockValue = {
  summary: 'si',
  metaphoricalPhrase: 'Frase',
  testimony: 'Testimonio',
  followEvaluation: 'Seguimiento'
};

describe('FollowUpEvaluation', () => {
  it('renders section title', () => {
    render(<FollowUpEvaluation value={mockValue} onChange={() => {}} />);
    expect(screen.getByText(/testimonios/i)).toBeInTheDocument();
  });
});
