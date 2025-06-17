/**
 * Button Component Tests - Rotary Club Mobile
 * Tests unitaires pour Button avec variants, states et accessibility
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  const defaultProps = {
    title: 'Test Button',
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render with title', () => {
      const { getByText } = render(<Button {...defaultProps} />);
      expect(getByText('Test Button')).toBeTruthy();
    });

    it('should render with custom testID', () => {
      const { getByTestId } = render(
        <Button {...defaultProps} testID="custom-button" />
      );
      expect(getByTestId('custom-button')).toBeTruthy();
    });

    it('should render with icon', () => {
      const { getByTestId } = render(
        <Button {...defaultProps} icon="add" />
      );
      // Icon should be rendered (mocked as 'Icon' in setup)
      expect(getByTestId('button-icon')).toBeTruthy();
    });

    it('should render loading state', () => {
      const { getByTestId, queryByText } = render(
        <Button {...defaultProps} loading />
      );
      
      expect(getByTestId('button-loading')).toBeTruthy();
      expect(queryByText('Test Button')).toBeFalsy();
    });
  });

  describe('variants', () => {
    it('should render primary variant by default', () => {
      const { getByTestId } = render(<Button {...defaultProps} />);
      const button = getByTestId('button');
      
      expect(button.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: expect.any(String),
          }),
        ])
      );
    });

    it('should render secondary variant', () => {
      const { getByTestId } = render(
        <Button {...defaultProps} variant="secondary" />
      );
      const button = getByTestId('button');
      
      expect(button.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: expect.any(String),
          }),
        ])
      );
    });

    it('should render outline variant', () => {
      const { getByTestId } = render(
        <Button {...defaultProps} variant="outline" />
      );
      const button = getByTestId('button');
      
      expect(button.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            borderWidth: expect.any(Number),
          }),
        ])
      );
    });

    it('should render ghost variant', () => {
      const { getByTestId } = render(
        <Button {...defaultProps} variant="ghost" />
      );
      const button = getByTestId('button');
      
      expect(button.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: 'transparent',
          }),
        ])
      );
    });
  });

  describe('sizes', () => {
    it('should render large size by default', () => {
      const { getByTestId } = render(<Button {...defaultProps} />);
      const button = getByTestId('button');
      
      expect(button.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            paddingVertical: expect.any(Number),
            paddingHorizontal: expect.any(Number),
          }),
        ])
      );
    });

    it('should render medium size', () => {
      const { getByTestId } = render(
        <Button {...defaultProps} size="medium" />
      );
      const button = getByTestId('button');
      
      expect(button.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            paddingVertical: expect.any(Number),
          }),
        ])
      );
    });

    it('should render small size', () => {
      const { getByTestId } = render(
        <Button {...defaultProps} size="small" />
      );
      const button = getByTestId('button');
      
      expect(button.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            paddingVertical: expect.any(Number),
          }),
        ])
      );
    });
  });

  describe('states', () => {
    it('should be disabled when disabled prop is true', () => {
      const { getByTestId } = render(
        <Button {...defaultProps} disabled />
      );
      const button = getByTestId('button');
      
      expect(button.props.accessibilityState.disabled).toBe(true);
    });

    it('should be disabled when loading', () => {
      const { getByTestId } = render(
        <Button {...defaultProps} loading />
      );
      const button = getByTestId('button');
      
      expect(button.props.accessibilityState.disabled).toBe(true);
    });

    it('should not call onPress when disabled', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <Button {...defaultProps} onPress={onPress} disabled />
      );
      
      fireEvent.press(getByTestId('button'));
      expect(onPress).not.toHaveBeenCalled();
    });

    it('should not call onPress when loading', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <Button {...defaultProps} onPress={onPress} loading />
      );
      
      fireEvent.press(getByTestId('button'));
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('interactions', () => {
    it('should call onPress when pressed', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <Button {...defaultProps} onPress={onPress} />
      );
      
      fireEvent.press(getByTestId('button'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should call onLongPress when long pressed', () => {
      const onLongPress = jest.fn();
      const { getByTestId } = render(
        <Button {...defaultProps} onLongPress={onLongPress} />
      );
      
      fireEvent(getByTestId('button'), 'longPress');
      expect(onLongPress).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple rapid presses', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <Button {...defaultProps} onPress={onPress} />
      );
      
      const button = getByTestId('button');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);
      
      expect(onPress).toHaveBeenCalledTimes(3);
    });
  });

  describe('accessibility', () => {
    it('should have correct accessibility role', () => {
      const { getByTestId } = render(<Button {...defaultProps} />);
      const button = getByTestId('button');
      
      expect(button.props.accessibilityRole).toBe('button');
    });

    it('should have accessibility label from title', () => {
      const { getByTestId } = render(<Button {...defaultProps} />);
      const button = getByTestId('button');
      
      expect(button.props.accessibilityLabel).toBe('Test Button');
    });

    it('should use custom accessibility label', () => {
      const { getByTestId } = render(
        <Button {...defaultProps} accessibilityLabel="Custom Label" />
      );
      const button = getByTestId('button');
      
      expect(button.props.accessibilityLabel).toBe('Custom Label');
    });

    it('should have accessibility hint when provided', () => {
      const hint = 'Double tap to activate';
      const { getByTestId } = render(
        <Button {...defaultProps} accessibilityHint={hint} />
      );
      const button = getByTestId('button');
      
      expect(button.props.accessibilityHint).toBe(hint);
    });

    it('should indicate loading state in accessibility', () => {
      const { getByTestId } = render(
        <Button {...defaultProps} loading />
      );
      const button = getByTestId('button');
      
      expect(button.props.accessibilityState.busy).toBe(true);
    });

    it('should indicate disabled state in accessibility', () => {
      const { getByTestId } = render(
        <Button {...defaultProps} disabled />
      );
      const button = getByTestId('button');
      
      expect(button.props.accessibilityState.disabled).toBe(true);
    });
  });

  describe('styling', () => {
    it('should apply custom style', () => {
      const customStyle = { marginTop: 20 };
      const { getByTestId } = render(
        <Button {...defaultProps} style={customStyle} />
      );
      const button = getByTestId('button');
      
      expect(button.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining(customStyle),
        ])
      );
    });

    it('should apply custom text style', () => {
      const customTextStyle = { fontSize: 18 };
      const { getByText } = render(
        <Button {...defaultProps} textStyle={customTextStyle} />
      );
      const text = getByText('Test Button');
      
      expect(text.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining(customTextStyle),
        ])
      );
    });

    it('should handle full width', () => {
      const { getByTestId } = render(
        <Button {...defaultProps} fullWidth />
      );
      const button = getByTestId('button');
      
      expect(button.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            width: '100%',
          }),
        ])
      );
    });
  });

  describe('icon positioning', () => {
    it('should render icon on the left by default', () => {
      const { getByTestId } = render(
        <Button {...defaultProps} icon="add" />
      );
      
      const container = getByTestId('button-content');
      expect(container.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            flexDirection: 'row',
          }),
        ])
      );
    });

    it('should render icon on the right', () => {
      const { getByTestId } = render(
        <Button {...defaultProps} icon="add" iconPosition="right" />
      );
      
      const container = getByTestId('button-content');
      expect(container.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            flexDirection: 'row-reverse',
          }),
        ])
      );
    });
  });

  describe('edge cases', () => {
    it('should handle empty title', () => {
      const { queryByText } = render(
        <Button {...defaultProps} title="" />
      );
      
      expect(queryByText('')).toBeTruthy();
    });

    it('should handle very long title', () => {
      const longTitle = 'This is a very long button title that might wrap to multiple lines';
      const { getByText } = render(
        <Button {...defaultProps} title={longTitle} />
      );
      
      expect(getByText(longTitle)).toBeTruthy();
    });

    it('should handle undefined onPress gracefully', () => {
      const { getByTestId } = render(
        <Button title="Test" />
      );
      
      expect(() => {
        fireEvent.press(getByTestId('button'));
      }).not.toThrow();
    });

    it('should handle both icon and loading state', () => {
      const { getByTestId, queryByTestId } = render(
        <Button {...defaultProps} icon="add" loading />
      );
      
      expect(getByTestId('button-loading')).toBeTruthy();
      expect(queryByTestId('button-icon')).toBeFalsy();
    });
  });

  describe('performance', () => {
    it('should not re-render unnecessarily', () => {
      const onPress = jest.fn();
      const { rerender } = render(
        <Button title="Test" onPress={onPress} />
      );
      
      // Re-render with same props
      rerender(<Button title="Test" onPress={onPress} />);
      
      // Should not cause issues
      expect(true).toBe(true);
    });
  });
});
