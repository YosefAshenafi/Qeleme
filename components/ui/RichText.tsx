import React, { useState } from 'react';
import Markdown from 'react-native-markdown-display';
import { StyleSheet, TextStyle, Text, View, Image, ActivityIndicator } from 'react-native';
import LatexOrText from './LatexOrText';

interface RichTextProps {
  text: string;
  style?: TextStyle | TextStyle[];
  color?: string;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  image_url?: string; // Added to support images in rich text
}

// Image component with loading states
const ImageComponent: React.FC<{ imageUrl: string; style?: any }> = ({ imageUrl, style }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const defaultImageStyle = {
    width: '100%',
    height: 200,
    resizeMode: 'contain' as const,
    marginVertical: 8,
    borderRadius: 8,
  };

  return (
    <View style={[defaultImageStyle, style]}>
      {loading && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.1)',
          borderRadius: 8,
        }}>
          <ActivityIndicator size="small" color="#666" />
        </View>
      )}
      
      {error ? (
        <View style={{
          width: '100%',
          height: 200,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.1)',
          borderRadius: 8,
        }}>
          <Text style={{ color: '#666', fontSize: 12 }}>Failed to load image</Text>
        </View>
      ) : (
        <Image
          source={{ uri: imageUrl }}
          style={[defaultImageStyle, style]}
          onLoadStart={() => setLoading(true)}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      )}
    </View>
  );
};

// Custom text renderer that handles HTML tags properly
const renderTextWithFormatting = (text: string, color: string, fontSize: number, lineHeight: number, textAlign: 'left' | 'center' | 'right'): React.ReactNode => {
  // Clean up the text first to remove any unwanted characters that might cause issues
  const cleanText = text
    .replace(/\r\n/g, ' ') // Replace Windows line breaks with spaces
    .replace(/\n/g, ' ') // Replace Unix line breaks with spaces
    .replace(/\r/g, ' ') // Replace Mac line breaks with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim(); // Remove leading/trailing whitespace

  // Parse HTML tags recursively
  const parseHtml = (html: string): React.ReactNode[] => {
    const parts = html.split(/(<[^>]+>.*?<\/[^>]+>)/g);
    
    return parts.map((part, index) => {
      const uniqueKey = `html-part-${index}-${part.length}-${part.charCodeAt(0)}-${part.charCodeAt(part.length - 1)}`;
      
      if (part.startsWith('<') && part.endsWith('>')) {
        // Handle HTML tags
        const tagMatch = part.match(/<(\w+)[^>]*>(.*?)<\/\1>/);
        if (tagMatch) {
          const [, tag, content] = tagMatch;
          
          // Recursively parse nested content
          const nestedContent = parseHtml(content);
          
          switch (tag.toLowerCase()) {
            case 'strong':
            case 'b':
              return (
                <Text key={uniqueKey} style={{ fontWeight: 'bold', color, fontSize, lineHeight, textAlign, fontFamily: 'System' }}>
                  {nestedContent}
                </Text>
              );
            case 'em':
            case 'i':
              return (
                <Text key={uniqueKey} style={{ fontStyle: 'italic', color, fontSize, lineHeight, textAlign, fontFamily: 'System' }}>
                  {nestedContent}
                </Text>
              );
            case 'u':
              return (
                <Text key={uniqueKey} style={{ textDecorationLine: 'underline', color, fontSize, lineHeight, textAlign, fontFamily: 'System' }}>
                  {nestedContent}
                </Text>
              );
            case 's':
            case 'strike':
              return (
                <Text key={uniqueKey} style={{ textDecorationLine: 'line-through', color, fontSize, lineHeight, textAlign, fontFamily: 'System' }}>
                  {nestedContent}
                </Text>
              );
            default:
              return (
                <Text key={uniqueKey} style={{ color, fontSize, lineHeight, textAlign, fontFamily: 'System' }}>
                  {nestedContent}
                </Text>
              );
          }
        }
      }
      
      // Regular text - clean it up before processing
      const cleanPart = part
        .replace(/\r\n/g, ' ')
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      return (
        <LatexOrText key={uniqueKey} content={cleanPart} />
      );
    });
  };
  
  return parseHtml(cleanText);
};

const RichText: React.FC<RichTextProps> = ({
  text,
  style,
  color = '#000',
  fontSize = 16,
  textAlign = 'left',
  lineHeight = 24,
  image_url,
}) => {
  const markdownStyles = {
    body: {
      color,
      fontSize,
      textAlign,
      lineHeight,
      flexWrap: 'wrap',
      flexShrink: 1,
      fontFamily: 'System', // Ensure consistent system font
      ...(Array.isArray(style) ? Object.assign({}, ...style) : style),
    },
    strong: {
      fontWeight: 'bold' as const,
      color,
    },
    em: {
      fontStyle: 'italic' as const,
      color,
    },
    u: {
      textDecorationLine: 'underline' as const,
      color,
    },
    s: {
      textDecorationLine: 'line-through' as const,
      color,
    },
    h1: {
      fontSize: fontSize * 1.5,
      fontWeight: 'bold' as const,
      color,
      marginBottom: 8,
    },
    h2: {
      fontSize: fontSize * 1.3,
      fontWeight: 'bold' as const,
      color,
      marginBottom: 6,
    },
    h3: {
      fontSize: fontSize * 1.1,
      fontWeight: 'bold' as const,
      color,
      marginBottom: 4,
    },
    p: {
      color,
      fontSize,
      lineHeight,
      marginBottom: 8,
    },
    ul: {
      color,
      fontSize,
      lineHeight,
    },
    ol: {
      color,
      fontSize,
      lineHeight,
    },
    li: {
      color,
      fontSize,
      lineHeight,
      marginBottom: 2,
    },
    blockquote: {
      backgroundColor: 'rgba(0,0,0,0.05)',
      paddingLeft: 8,
      borderLeftWidth: 3,
      borderLeftColor: color,
      marginVertical: 4,
    },
    code: {
      backgroundColor: 'rgba(0,0,0,0.1)',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 3,
      fontFamily: 'monospace',
      fontSize: fontSize * 0.9,
    },
    pre: {
      backgroundColor: 'rgba(0,0,0,0.1)',
      padding: 8,
      borderRadius: 4,
      marginVertical: 4,
    },
    table: {
      borderWidth: 1,
      borderColor: color,
      borderRadius: 4,
    },
    th: {
      backgroundColor: 'rgba(0,0,0,0.1)',
      padding: 8,
      fontWeight: 'bold' as const,
      borderBottomWidth: 1,
      borderBottomColor: color,
    },
    td: {
      padding: 8,
      borderBottomWidth: 1,
      borderBottomColor: color,
    },
  };

  // Convert HTML tags to Markdown format
  const convertHtmlToMarkdown = (htmlText: string): string => {
    return htmlText
      // Convert HTML tags to Markdown equivalents
      .replace(/<strong\b[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b\b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em\b[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i\b[^>]*>(.*?)<\/i>/gi, '*$1*')
      .replace(/<u\b[^>]*>(.*?)<\/u>/gi, '<u>$1</u>')
      .replace(/<s\b[^>]*>(.*?)<\/s>/gi, '~~$1~~')
      .replace(/<strike\b[^>]*>(.*?)<\/strike>/gi, '~~$1~~')
      .replace(/<h1\b[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2\b[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3\b[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<h4\b[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
      .replace(/<h5\b[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
      .replace(/<h6\b[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
      .replace(/<p\b[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<ul\b[^>]*>(.*?)<\/ul>/gi, (match, content) => {
        return content.replace(/<li\b[^>]*>(.*?)<\/li>/gi, '- $1\n');
      })
      .replace(/<ol\b[^>]*>(.*?)<\/ol>/gi, (match, content) => {
        let counter = 1;
        return content.replace(/<li\b[^>]*>(.*?)<\/li>/gi, () => `${counter++}. $1\n`);
      })
      .replace(/<blockquote\b[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n')
      .replace(/<code\b[^>]*>(.*?)<\/code>/gi, '`$1`')
      .replace(/<pre\b[^>]*>(.*?)<\/pre>/gi, '```\n$1\n```\n\n')
      .replace(/<a\b[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      .replace(/<img\b[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')
      .replace(/<img\b[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)')
      // Remove any remaining HTML tags
      .replace(/<[^>]*>/g, '')
      // Clean up extra whitespace
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
  };

  // Use custom renderer for better HTML support
  return (
    <View>
      {image_url && (
        <ImageComponent imageUrl={image_url} />
      )}
      <Text style={[markdownStyles.body, style]}>
        {renderTextWithFormatting(text, color, fontSize, lineHeight, textAlign)}
      </Text>
    </View>
  );
};

export default RichText;
