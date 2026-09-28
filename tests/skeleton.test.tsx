import React from 'react';
import { Text } from 'react-native';
import { render, screen, act } from '@testing-library/react-native';
import { MockData } from '../src/components/LoadingSkeleton';

afterEach(() => jest.useRealTimers());
test('skeleton exposes loading and hides pending data until ready, including resource changes', () => {
  jest.useFakeTimers();
  const view = render(<MockData resourceKey="one"><Text>Primeiro perfil</Text></MockData>);
  expect(screen.getByLabelText('Carregando dados')).toBeBusy();
  expect(screen.queryByText('Primeiro perfil')).toBeNull();
  act(() => jest.advanceTimersByTime(450));
  expect(screen.getByText('Primeiro perfil')).toBeTruthy();
  view.rerender(<MockData resourceKey="two"><Text>Segundo perfil</Text></MockData>);
  expect(screen.queryByText('Segundo perfil')).toBeNull();
  act(() => jest.advanceTimersByTime(450));
  expect(screen.getByText('Segundo perfil')).toBeTruthy();
  expect(screen.queryByLabelText('Carregando dados')).toBeNull();
});
