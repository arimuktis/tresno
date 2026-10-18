import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Check } from 'lucide-react-native';
import { useThemeStore } from '../../../theme/useThemeStore';

interface StepProgressBarProps {
  totalSteps: number;
  currentStep: number; // 1-indexed
  style?: ViewStyle;
}

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  totalSteps,
  currentStep,
  style,
}) => {
  const { colors, isDark } = useThemeStore();

  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <View style={[styles.container, style]}>
      {steps.map((stepNum, idx) => {
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;
        const isLast = idx === steps.length - 1;

        return (
          <React.Fragment key={stepNum}>
            {/* Step Node */}
            <View
              style={[
                styles.node,
                isCompleted && [
                  styles.nodeCompleted,
                  { backgroundColor: colors.primary, borderColor: colors.primary },
                ],
                isCurrent && [
                  styles.nodeCurrent,
                  {
                    borderColor: colors.primary,
                    backgroundColor: isDark ? colors.background : '#FFFFFF',
                  },
                ],
                !isCompleted &&
                  !isCurrent && [
                    styles.nodeFuture,
                    {
                      borderColor: isDark ? colors.border : '#E2E8F0',
                      backgroundColor: isDark ? colors.surfaceCard : '#F8FAFC',
                    },
                  ],
              ]}
            >
              {isCompleted ? (
                <Check size={12} color="#FFFFFF" strokeWidth={3} />
              ) : isCurrent ? (
                <View style={[styles.currentCenterDot, { backgroundColor: colors.primary }]} />
              ) : null}
            </View>

            {/* Connecting Line between Nodes */}
            {!isLast && (
              <View
                style={[
                  styles.connectorLine,
                  {
                    backgroundColor: isCompleted
                      ? colors.primary
                      : isDark
                      ? colors.border
                      : '#E2E8F0',
                  },
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 12,
  },
  node: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeCompleted: {
    borderWidth: 0,
  },
  nodeCurrent: {
    borderWidth: 2.5,
  },
  nodeFuture: {
    borderWidth: 2,
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    marginTop: -1,
  },
  currentCenterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectorLine: {
    flex: 1,
    height: 2.5,
    marginHorizontal: 4,
    borderRadius: 2,
  },
});
