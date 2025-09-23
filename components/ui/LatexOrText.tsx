import React from 'react';
import { Text, TextStyle, StyleSheet, View } from 'react-native';
import MathView from 'react-native-math-view';

interface LatexOrTextProps {
  content: string;
  inline?: boolean;        // Inline math or block math
  textStyle?: TextStyle;   // Optional styling for plain text
}

// Regex patterns for LaTeX detection
const inlineLatexRegex = /\\\((.*?)\\\)/g;
const blockLatexRegex = /\\\[(.*?)\\\]/g;

// Function to clean LaTeX content by removing common commands
const cleanLatexContent = (input: string): string => {
  return input
    .replace(/\\mathrm{(.*?)}/g, (_, inner) => inner) // remove \mathrm{}
    .replace(/\\text{(.*?)}/g, (_, inner) => inner) // remove \text{}
    .replace(/\\textbf{(.*?)}/g, (_, inner) => inner) // remove \textbf{}
    .replace(/\\textit{(.*?)}/g, (_, inner) => inner); // remove \textit{}
};

// Function to parse mixed content and return array of text and LaTeX parts
const parseMixedContent = (content: string): Array<{ type: 'text' | 'latex'; content: string; inline: boolean }> => {
  const parts: Array<{ type: 'text' | 'latex'; content: string; inline: boolean }> = [];
  let lastIndex = 0;
  
  // Find all LaTeX matches
  const allMatches: Array<{ match: RegExpExecArray; inline: boolean }> = [];
  
  // Find inline LaTeX matches
  let match;
  inlineLatexRegex.lastIndex = 0;
  while ((match = inlineLatexRegex.exec(content)) !== null) {
    allMatches.push({ match, inline: true });
  }
  
  // Find block LaTeX matches
  blockLatexRegex.lastIndex = 0;
  while ((match = blockLatexRegex.exec(content)) !== null) {
    allMatches.push({ match, inline: false });
  }
  
  // Sort matches by position
  allMatches.sort((a, b) => a.match.index! - b.match.index!);
  
  // Process matches
  for (const { match, inline } of allMatches) {
    // Add text before LaTeX
    if (match.index! > lastIndex) {
      const textContent = content.slice(lastIndex, match.index!);
      if (textContent.trim()) {
        parts.push({ type: 'text', content: textContent, inline: true });
      }
    }
    
    // Add LaTeX content
    const latexContent = cleanLatexContent(match[1]);
    if (latexContent.trim()) {
      parts.push({ type: 'latex', content: latexContent, inline });
    }
    
    lastIndex = match.index! + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < content.length) {
    const textContent = content.slice(lastIndex);
    if (textContent.trim()) {
      parts.push({ type: 'text', content: textContent, inline: true });
    }
  }
  
  return parts;
};

const LatexOrText: React.FC<LatexOrTextProps> = ({ content, inline = true, textStyle }) => {
  const hasLatex = /\\\(|\\\)|\\\[|\\\]/.test(content);

  if (!hasLatex) {
    return <Text style={[styles.text, textStyle]}>{content}</Text>;
  }

  const parts = parseMixedContent(content);

  return (
    <View style={styles.container}>
      {parts.map((part, index) => {
        const uniqueKey = `${part.type}-${index}-${part.content.substring(0, 10)}`;
        
        if (part.type === 'latex') {
          return (
            <MathView
              key={uniqueKey}
              math={part.content}
              resizeMode="contain"
              style={[styles.math, part.inline ? styles.inlineMath : styles.blockMath]}
              mathJaxOptions={{
                displayMessages: false,
                messageStyle: { color: 'red' },
              }}
            />
          );
        } else {
          return (
            <Text key={uniqueKey} style={[styles.text, textStyle]}>
              {part.content}
            </Text>
          );
        }
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  math: {
    marginVertical: 2,
  },
  inlineMath: {
    marginHorizontal: 2,
  },
  blockMath: {
    marginVertical: 4,
  },
});

export default LatexOrText;
