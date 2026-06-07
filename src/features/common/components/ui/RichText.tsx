import React, { useState } from 'react';
import { StyleProp, StyleSheet, TextStyle, Text, View, Image, ActivityIndicator } from 'react-native';
import LatexOrText from './LatexOrText';

interface RichTextProps {
  text: string;
  style?: StyleProp<TextStyle>;
  color?: string;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  image_url?: string; 
}

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

const renderTextWithFormatting = (text: string, color: string, fontSize: number, lineHeight: number, textAlign: 'left' | 'center' | 'right'): React.ReactNode => {
  
  const cleanText = text
    .replace(/\r\n/g, ' ') 
    .replace(/\n/g, ' ') 
    .replace(/\r/g, ' ') 
    .replace(/\s+/g, ' ') 
    .trim(); 

  
  const parseHtml = (html: string): React.ReactNode[] => {
    const parts = html.split(/(<[^>]+>.*?<\/[^>]+>)/g);
    
    return parts.map((part, index) => {
      const uniqueKey = `html-part-${index}-${part.length}-${part.charCodeAt(0)}-${part.charCodeAt(part.length - 1)}`;
      
      if (part.startsWith('<') && part.endsWith('>')) {
        
        const tagMatch = part.match(/<(\w+)[^>]*>(.*?)<\/\1>/);
        if (tagMatch) {
          const [, tag, content] = tagMatch;
          
          
          const leadingSpaces = content.match(/^\s*/)?.[0] || '';
          const trailingSpaces = content.match(/\s*$/)?.[0] || '';
          const trimmedContent = content.trim();
          
          
          const nestedContent = parseHtml(trimmedContent);
          
          let styledElement;
          switch (tag.toLowerCase()) {
            case 'strong':
            case 'b':
              styledElement = (
                <Text key={uniqueKey} style={{ fontWeight: 'bold', color, fontSize, lineHeight, textAlign, fontFamily: 'System' }}>
                  {nestedContent}
                </Text>
              );
              break;
            case 'em':
            case 'i':
              styledElement = (
                <Text key={uniqueKey} style={{ fontStyle: 'italic', color, fontSize, lineHeight, textAlign, fontFamily: 'System' }}>
                  {nestedContent}
                </Text>
              );
              break;
            case 'u':
              styledElement = (
                <Text key={uniqueKey} style={{
                  textDecorationLine: 'underline',
                  textDecorationStyle: 'solid',
                  textDecorationColor: color,
                  color,
                  fontSize,
                  lineHeight,
                  textAlign,
                  fontFamily: 'System'
                }}>
                  {nestedContent}
                </Text>
              );
              break;
            case 's':
            case 'strike':
              styledElement = (
                <Text key={uniqueKey} style={{ textDecorationLine: 'line-through', color, fontSize, lineHeight, textAlign, fontFamily: 'System' }}>
                  {nestedContent}
                </Text>
              );
              break;
            default:
              styledElement = (
                <Text key={uniqueKey} style={{ color, fontSize, lineHeight, textAlign, fontFamily: 'System' }}>
                  {nestedContent}
                </Text>
              );
          }
          
          
          return (
            <React.Fragment key={uniqueKey}>
              {leadingSpaces && <Text>{leadingSpaces}</Text>}
              {styledElement}
              {trailingSpaces && <Text>{trailingSpaces}</Text>}
            </React.Fragment>
          );
        }
      }
      
      
      const cleanPart = part
        .replace(/\r\n/g, ' ')
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ')
        .replace(/\s+/g, ' '); 
      
      
      if (cleanPart) {
        return (
          <LatexOrText key={uniqueKey} content={cleanPart} color={color} />
        );
      }
      return null;
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
  const flattenedStyle = StyleSheet.flatten(style) ?? {};

  const markdownStyles = {
    body: {
      color,
      fontSize,
      textAlign,
      lineHeight,
      flexWrap: 'wrap',
      flexShrink: 1,
      fontFamily: 'System',
      ...flattenedStyle,
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
      textDecorationStyle: 'solid' as const,
      textDecorationColor: color,
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
      backgroundColor: 'transparent',
      paddingHorizontal: 0,
      paddingVertical: 0,
      borderRadius: 0,
      fontFamily: 'System',
      fontSize: fontSize,
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
  } as const;

  

  
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
