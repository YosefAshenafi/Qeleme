import React from 'react';
import { Text, TextStyle, StyleSheet, Platform } from 'react-native';

interface LatexOrTextProps {
  content: string;
  inline?: boolean;        // Inline math or block math
  textStyle?: TextStyle;   // Optional styling for plain text
}

// Regex patterns for LaTeX detection
const inlineLatexRegex = /\\\((.*?)\\\)/g;
const blockLatexRegex = /\\\[(.*?)\\\]/g;

// Function to convert LaTeX to properly formatted text with platform-specific Unicode handling
const latexToText = (input: string): string => {
  const isAndroid = Platform.OS === 'android';
  
  return input
    // Preprocess: Clean up spaces in subscript and superscript patterns
    .replace(/_\s*{([^}]+)}/g, '_{$1}')  // Fix _{4} -> _{4} (remove spaces)
    .replace(/_\s+([0-9a-zA-Z])/g, '_$1')  // Fix _ 4 -> _4 (remove spaces)
    .replace(/\^\s*{([^}]+)}/g, '^{$1}')  // Fix ^{2+} -> ^{2+} (remove spaces)
    .replace(/\^\s+([0-9a-zA-Z])/g, '^$1')  // Fix ^ 2 -> ^2 (remove spaces)
    .replace(/\\mathrm{(.*?)}/g, (_, inner) => inner) // remove \mathrm{}
    .replace(/\\text{(.*?)}/g, (_, inner) => inner) // remove \text{}
    .replace(/\\textbf{(.*?)}/g, (_, inner) => inner) // remove \textbf{}
    .replace(/\\textit{(.*?)}/g, (_, inner) => inner) // remove \textit{}
    // Greek letters
    .replace(/\\pi/g, 'π')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\epsilon/g, 'ε')
    .replace(/\\theta/g, 'θ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\phi/g, 'φ')
    .replace(/\\omega/g, 'ω')
    // Math symbols
    .replace(/\\infty/g, '∞')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\neq/g, '≠')
    .replace(/\\approx/g, '≈')
    .replace(/\\pm/g, '±')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\cdot/g, '·')
    // Arrows
    .replace(/\\rightarrow/g, '→')
    .replace(/\\leftarrow/g, '←')
    .replace(/\\leftrightarrow/g, '↔')
    .replace(/\\Rightarrow/g, '⇒')
    .replace(/\\Leftarrow/g, '⇐')
    .replace(/\\Leftrightarrow/g, '⇔')
    .replace(/\\rightleftharpoons/g, '⇌')
    // Parentheses and brackets
    .replace(/\\left\(/g, '(')
    .replace(/\\right\)/g, ')')
    .replace(/\\left\[/g, '[')
    .replace(/\\right\]/g, ']')
    .replace(/\\left\{/g, '{')
    .replace(/\\right\}/g, '}')
    // Spacing
    .replace(/\\,|\\:|\\;|\\!/g, ' ')
    .replace(/\\\\/g, '\n')
    .replace(/\\quad|\\qquad/g, '  ')
    // Fractions - convert to proper fraction format
    .replace(/\\frac{([^}]+)}{([^}]+)}/g, (_, numerator, denominator) => {
      // Handle common fractions with Unicode fraction characters
      const num = numerator.trim();
      const den = denominator.trim();
      
      // Common fractions that have Unicode equivalents
      const commonFractions: { [key: string]: string } = {
        '1/2': '½', '1/3': '⅓', '2/3': '⅔', '1/4': '¼', '3/4': '¾',
        '1/5': '⅕', '2/5': '⅖', '3/5': '⅗', '4/5': '⅘', '1/6': '⅙',
        '5/6': '⅚', '1/7': '⅐', '1/8': '⅛', '3/8': '⅜', '5/8': '⅝',
        '7/8': '⅞', '1/9': '⅑', '1/10': '⅒'
      };
      
      const fractionKey = `${num}/${den}`;
      if (commonFractions[fractionKey]) {
        return commonFractions[fractionKey];
      }
      
      // For other fractions, use proper fraction formatting
      if (isAndroid) {
        // On Android, use Unicode superscript and subscript
        const superscripts: { [key: string]: string } = {
          '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
          '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾'
        };
        const subscripts: { [key: string]: string } = {
          '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
          '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎'
        };
        
        const supNum = num.split('').map((char: string) => superscripts[char] || char).join('');
        const subDen = den.split('').map((char: string) => subscripts[char] || char).join('');
        return `${supNum}⁄${subDen}`;
      } else {
        // On iOS, use fraction slash with proper formatting
        return `${num}⁄${den}`;
      }
    })
    // Square roots
    .replace(/\\sqrt{([^}]+)}/g, '√($1)')
    // Sum and integral
    .replace(/\\sum/g, 'Σ')
    .replace(/\\int/g, '∫')
    // Handle subscripts first (both braced and unbraced) - order matters!
    // Process braced subscripts first: _{content}
    .replace(/_{([^}]+)}/g, (_, content) => {
      if (isAndroid) {
        // For Android, use Unicode subscripts
        const subscripts: { [key: string]: string } = {
          '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
          '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎', 'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ',
          'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ', 'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ',
          'v': 'ᵥ', 'x': 'ₓ'
        };
        return content.split('').map((char: string) => subscripts[char] || char).join('');
      } else {
        // For iOS, use proper Unicode subscripts
        const subscripts: { [key: string]: string } = {
          '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
          '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎', 'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ',
          'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ', 'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ',
          'v': 'ᵥ', 'x': 'ₓ'
        };
        return content.split('').map((char: string) => subscripts[char] || char).join('');
      }
    })
    // Handle single character subscripts without braces: _char
    .replace(/_([0-9a-zA-Z])/g, (_, char) => {
      if (isAndroid) {
        // For Android, use Unicode subscripts
        const subscripts: { [key: string]: string } = {
          '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
          'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
          'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ', 'v': 'ᵥ', 'x': 'ₓ'
        };
        return subscripts[char] || char;
      } else {
        // For iOS, use proper Unicode subscripts
        const subscripts: { [key: string]: string } = {
          '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
          'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
          'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ', 'v': 'ᵥ', 'x': 'ₓ'
        };
        return subscripts[char] || char;
      }
    })
    // Handle any remaining underscore patterns that might have been missed
    .replace(/_([^{}\s]+)/g, (_, content) => {
      if (isAndroid) {
        // For Android, use Unicode subscripts
        const subscripts: { [key: string]: string } = {
          '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
          'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
          'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ', 'v': 'ᵥ', 'x': 'ₓ'
        };
        return content.split('').map((char: string) => subscripts[char] || char).join('');
      } else {
        // For iOS, use proper Unicode subscripts
        const subscripts: { [key: string]: string } = {
          '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
          'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
          'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ', 'v': 'ᵥ', 'x': 'ₓ'
        };
        return content.split('').map((char: string) => subscripts[char] || char).join('');
      }
    })
    // Handle superscripts after subscripts
    .replace(/\^{([^}]+)}/g, (_, content) => {
      if (isAndroid) {
        // For Android, use Unicode superscripts
        const superscripts: { [key: string]: string } = {
          '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
          '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', 'n': 'ⁿ', 'i': 'ⁱ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ',
          'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ', 'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'j': 'ʲ', 'k': 'ᵏ',
          'l': 'ˡ', 'm': 'ᵐ', 'o': 'ᵒ', 'p': 'ᵖ', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ', 'v': 'ᵛ', 'w': 'ʷ'
        };
        return content.split('').map((char: string) => superscripts[char] || char).join('');
      } else {
        // For iOS, use proper Unicode superscripts
        const superscripts: { [key: string]: string } = {
          '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
          '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', 'n': 'ⁿ', 'i': 'ⁱ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ',
          'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ', 'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'j': 'ʲ', 'k': 'ᵏ',
          'l': 'ˡ', 'm': 'ᵐ', 'o': 'ᵒ', 'p': 'ᵖ', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ', 'v': 'ᵛ', 'w': 'ʷ'
        };
        return content.split('').map((char: string) => superscripts[char] || char).join('');
      }
    })
    // Handle chemical formulas with numbers as subscripts (NH3, H2O, NH4+, etc.)
    .replace(/([A-Z][a-z]?)(\d+)([+-]?)/g, (_, element, number, charge) => {
      if (isAndroid) {
        // For Android, use Unicode subscripts but with smaller font size
        const subscripts: { [key: string]: string } = {
          '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
        };
        const subscriptNumber = number.split('').map((char: string) => subscripts[char] || char).join('');
        
        // Handle charges
        if (charge) {
          const superscripts: { [key: string]: string } = {
            '+': '⁺', '-': '⁻'
          };
          const superscriptCharge = charge.split('').map((char: string) => superscripts[char] || char).join('');
          return element + subscriptNumber + superscriptCharge;
        }
        
        return element + subscriptNumber;
      } else {
        // For iOS, convert numbers to subscripts
        const subscripts: { [key: string]: string } = {
          '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
        };
        const subscriptNumber = number.split('').map((char: string) => subscripts[char] || char).join('');
        
        // Handle charges
        if (charge) {
          const superscripts: { [key: string]: string } = {
            '+': '⁺', '-': '⁻'
          };
          const superscriptCharge = charge.split('').map((char: string) => superscripts[char] || char).join('');
          return element + subscriptNumber + superscriptCharge;
        }
        
        return element + subscriptNumber;
      }
    })
    // Handle standalone charges (+ and -)
    .replace(/([A-Z][a-z]?)([+-])/g, (_, element, charge) => {
      if (isAndroid) {
        const superscripts: { [key: string]: string } = {
          '+': '⁺', '-': '⁻'
        };
        return element + (superscripts[charge] || charge);
      } else {
        const superscripts: { [key: string]: string } = {
          '+': '⁺', '-': '⁻'
        };
        return element + (superscripts[charge] || charge);
      }
    })
    .trim();
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
    const latexContent = latexToText(match[1]);
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
  // Very specific chemical formula detection - only match clear chemical patterns
  const hasChemicalFormula = /[A-Z][a-z]?\d+[A-Z]|[A-Z][a-z]?\d+[_{]|[A-Z][a-z]?\d+|[A-Z][a-z]?[+-]|\\(rightleftharpoons|rightarrow|leftarrow\\)/.test(content);
  const hasFraction = /\\frac\{[^}]+\}\{[^}]+\}/.test(content);
  // Only detect subscripts/superscripts when they're clearly mathematical (with braces or specific patterns)
  const hasMathSubscript = /_{[^}]+}|\^\{[^}]+\}/.test(content);

  // Check for common non-mathematical patterns that might cause false positives
  const hasCommonTextPatterns = /[a-z]+_[a-z]+|\s+_\s+|\s+\^\s+/.test(content);

  // Only process as LaTeX if there are clear LaTeX delimiters or very specific mathematical patterns
  // Be very conservative to avoid false positives - exclude if it has common text patterns
  if (!hasLatex && !hasCommonTextPatterns && (hasChemicalFormula || hasFraction || hasMathSubscript)) {
    const processedContent = latexToText(content);
    return (
      <Text style={[styles.text, textStyle]}>
        <Text style={[styles.math, styles.inlineMath]}>
          {processedContent}
        </Text>
      </Text>
    );
  }

  if (!hasLatex) {
    return <Text style={[styles.text, textStyle]}>{content}</Text>;
  }

  const parts = parseMixedContent(content);

  return (
    <Text style={[styles.text, textStyle]}>
      {parts.map((part, index) => {
        const uniqueKey = `${part.type}-${index}-${part.content.length}-${part.content.charCodeAt(0)}-${part.content.charCodeAt(part.content.length - 1)}`;
        
        if (part.type === 'latex') {
          return (
            <Text key={uniqueKey} style={[styles.math, part.inline ? styles.inlineMath : styles.blockMath]}>
              {part.content}
            </Text>
          );
        } else {
          return part.content;
        }
      })}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'System', // Ensure consistent system font
  },
  math: {
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'monospace',
    fontWeight: '500',
    color: '#2c3e50',
    fontSize: Platform.OS === 'android' ? 14 : 16, // Slightly smaller on Android for better readability
  },
  inlineMath: {
    marginHorizontal: 2,
  },
  blockMath: {
    marginVertical: 4,
    textAlign: 'center',
  },
});

export default LatexOrText;
