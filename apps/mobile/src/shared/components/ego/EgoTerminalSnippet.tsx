import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Copy, Check } from 'lucide-react-native';
import { toast } from '../../stores/useToastStore';

export interface EgoTerminalSnippetProps {
  stepNumber?: number | string;
  stepInstruction?: string;
  headerLabel?: string;
  commandText?: string;
  previewBulletText?: string;
}

export const EgoTerminalSnippet: React.FC<EgoTerminalSnippetProps> = ({
  stepNumber = 2,
  stepInstruction = 'Type /ego-browser followed by your task in the agent, or specify using ego browser in your prompt.',
  headerLabel = 'Paste example to your agent',
  commandText = '/ego-browser OpenAI & Anthropic blogs, summarize latest noteworthy updates',
  previewBulletText = "I'll use ego-browser to explore OpenAI's main page and discover today's interesting articles — featured article, 'Did you know', 'In the news', 'On this day', etc.",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(commandText);
      setCopied(true);
      toast.success('Prompt disalin ke clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <View style={styles.container}>
      {/* Step Instruction */}
      {Boolean(stepInstruction) && (
        <Text style={styles.stepInstruction}>
          <Text style={{ fontWeight: '600', color: '#64748B' }}>{stepNumber}. </Text>
          {stepInstruction}
        </Text>
      )}

      {/* Terminal Slate Container */}
      <View style={styles.terminalBox}>
        {/* Header Label */}
        <View style={styles.terminalHeader}>
          <Text style={styles.terminalHeaderText}>{headerLabel}</Text>
        </View>

        {/* Code Snippet Box */}
        <View style={styles.codeRow}>
          <Text style={styles.codeText}>{commandText}</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleCopy}
            style={styles.copyButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {copied ? (
              <Check size={14} color="#10B981" />
            ) : (
              <Copy size={14} color="#94A3B8" />
            )}
          </TouchableOpacity>
        </View>

        {/* Muted Agent Prompt Preview Underneath */}
        {Boolean(previewBulletText) && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewBullet}>
              • <Text style={styles.previewText}>{previewBulletText}</Text>
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 4,
  },
  stepInstruction: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#475569',
    marginBottom: 10,
  },
  terminalBox: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  terminalHeader: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  terminalHeaderText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    marginHorizontal: 8,
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  codeText: {
    flex: 1,
    fontSize: 12,
    color: '#38BDF8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 17,
    marginRight: 8,
  },
  copyButton: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  previewContainer: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
  },
  previewBullet: {
    fontSize: 10.5,
    color: '#64748B',
    lineHeight: 15,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  previewText: {
    color: '#64748B',
  },
});
