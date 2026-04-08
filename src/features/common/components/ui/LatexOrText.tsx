import React from 'react';
import { Text, TextStyle, Platform } from 'react-native';

import { latexOrTextStyles as styles } from './LatexOrText.styles';

interface LatexOrTextProps {
  content: string;
  inline?: boolean;        
  textStyle?: TextStyle;   
  color?: string;          
}

const inlineLatexRegex = /\\\((.*?)\\\)/g;
const blockLatexRegex = /\\\[(.*?)\\\]/g;

const latexToText = (input: string): string => {
  const isAndroid = Platform.OS === 'android';
  
  return input
    .replace(/_\s*{([^}]+)}/g, '_{$1}')  
    .replace(/_\s+([0-9a-zA-Z])/g, '_$1')  
    .replace(/\^\s*{([^}]+)}/g, '^{$1}')  
    .replace(/\^\s+([0-9a-zA-Z])/g, '^$1')  
    .replace(/\\mathrm{(.*?)}/g, (_, inner) => inner) 
    .replace(/\\text{(.*?)}/g, (_, inner) => inner) 
    .replace(/\\textbf{(.*?)}/g, (_, inner) => inner) 
    .replace(/\\textit{(.*?)}/g, (_, inner) => inner) 
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
    .replace(/\\infty/g, '∞')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\neq/g, '≠')
    .replace(/\\approx/g, '≈')
    .replace(/\\pm/g, '±')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\cdot/g, '·')
    .replace(/\\rightarrow/g, '→')
    .replace(/\\leftarrow/g, '←')
    .replace(/\\leftrightarrow/g, '↔')
    .replace(/\\Rightarrow/g, '⇒')
    .replace(/\\Leftarrow/g, '⇐')
    .replace(/\\Leftrightarrow/g, '⇔')
    .replace(/\\rightleftharpoons/g, '⇌')
    .replace(/\\left\(/g, '(')
    .replace(/\\right\)/g, ')')
    .replace(/\\left\[/g, '[')
    .replace(/\\right\]/g, ']')
    .replace(/\\left\{/g, '{')
    .replace(/\\right\}/g, '}')
    .replace(/\\,|\\:|\\;|\\!/g, ' ')
    .replace(/\\\\/g, ' ') 
    .replace(/\\quad|\\qquad/g, '  ')
    .replace(/\\frac{([^}]+)}{([^}]+)}/g, (_, numerator, denominator) => {
      
      const num = numerator.trim();
      const den = denominator.trim();
      
      
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
      
      
      if (isAndroid) {
        
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
        
        return `${num}⁄${den}`;
      }
    })
    .replace(/\\sqrt{([^}]+)}/g, '√($1)')
    .replace(/\\sum/g, 'Σ')
    .replace(/\\int/g, '∫')
    .replace(/_{([^}]+)}/g, (_, content) => {
      if (isAndroid) {
        
        const subscripts: { [key: string]: string } = {
          '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
          '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎', 'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ',
          'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ', 'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ',
          'v': 'ᵥ', 'x': 'ₓ'
        };
        return content.split('').map((char: string) => subscripts[char] || char).join('');
      } else {
        
        const subscripts: { [key: string]: string } = {
          '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
          '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎', 'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ',
          'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ', 'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ',
          'v': 'ᵥ', 'x': 'ₓ'
        };
        return content.split('').map((char: string) => subscripts[char] || char).join('');
      }
    })
    .replace(/_([0-9a-zA-Z])/g, (_, char) => {
      if (isAndroid) {
        
        const subscripts: { [key: string]: string } = {
          '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
          'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
          'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ', 'v': 'ᵥ', 'x': 'ₓ'
        };
        return subscripts[char] || char;
      } else {
        
        const subscripts: { [key: string]: string } = {
          '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
          'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
          'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ', 'v': 'ᵥ', 'x': 'ₓ'
        };
        return subscripts[char] || char;
      }
    })
    .replace(/_([^{}\s]+)/g, (_, content) => {
      if (isAndroid) {
        
        const subscripts: { [key: string]: string } = {
          '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
          'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
          'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ', 'v': 'ᵥ', 'x': 'ₓ'
        };
        return content.split('').map((char: string) => subscripts[char] || char).join('');
      } else {
        
        const subscripts: { [key: string]: string } = {
          '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
          'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
          'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ', 'v': 'ᵥ', 'x': 'ₓ'
        };
        return content.split('').map((char: string) => subscripts[char] || char).join('');
      }
    })
    .replace(/\^{([^}]+)}/g, (_, content) => {
      if (isAndroid) {
        
        const superscripts: { [key: string]: string } = {
          '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
          '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', 'n': 'ⁿ', 'i': 'ⁱ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ',
          'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ', 'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'j': 'ʲ', 'k': 'ᵏ',
          'l': 'ˡ', 'm': 'ᵐ', 'o': 'ᵒ', 'p': 'ᵖ', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ', 'v': 'ᵛ', 'w': 'ʷ'
        };
        return content.split('').map((char: string) => superscripts[char] || char).join('');
      } else {
        
        const superscripts: { [key: string]: string } = {
          '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
          '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', 'n': 'ⁿ', 'i': 'ⁱ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ',
          'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ', 'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'j': 'ʲ', 'k': 'ᵏ',
          'l': 'ˡ', 'm': 'ᵐ', 'o': 'ᵒ', 'p': 'ᵖ', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ', 'v': 'ᵛ', 'w': 'ʷ'
        };
        return content.split('').map((char: string) => superscripts[char] || char).join('');
      }
    })
    .replace(/([A-Z][a-z]?)(\d+)([+-]?)/g, (_, element, number, charge) => {
      if (isAndroid) {
        
        const subscripts: { [key: string]: string } = {
          '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
        };
        const subscriptNumber = number.split('').map((char: string) => subscripts[char] || char).join('');
        
        
        if (charge) {
          const superscripts: { [key: string]: string } = {
            '+': '⁺', '-': '⁻'
          };
          const superscriptCharge = charge.split('').map((char: string) => superscripts[char] || char).join('');
          return element + subscriptNumber + superscriptCharge;
        }
        
        return element + subscriptNumber;
      } else {
        
        const subscripts: { [key: string]: string } = {
          '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
        };
        const subscriptNumber = number.split('').map((char: string) => subscripts[char] || char).join('');
        
        
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

const parseMixedContent = (content: string): Array<{ type: 'text' | 'latex'; content: string; inline: boolean }> => {
  const parts: Array<{ type: 'text' | 'latex'; content: string; inline: boolean }> = [];
  let lastIndex = 0;
  
  
  const allMatches: Array<{ match: RegExpExecArray; inline: boolean }> = [];
  
  
  let match;
  inlineLatexRegex.lastIndex = 0;
  while ((match = inlineLatexRegex.exec(content)) !== null) {
    allMatches.push({ match, inline: true });
  }
  
  
  blockLatexRegex.lastIndex = 0;
  while ((match = blockLatexRegex.exec(content)) !== null) {
    allMatches.push({ match, inline: false });
  }
  
  
  allMatches.sort((a, b) => a.match.index! - b.match.index!);
  
  
  for (const { match, inline } of allMatches) {
    
    if (match.index! > lastIndex) {
      const textContent = content.slice(lastIndex, match.index!);
      if (textContent.trim()) {
        parts.push({ type: 'text', content: textContent, inline: true });
      }
    }
    
    
    const latexContent = latexToText(match[1]);
    if (latexContent.trim()) {
      parts.push({ type: 'latex', content: latexContent, inline });
    }
    
    lastIndex = match.index! + match[0].length;
  }
  
  
  if (lastIndex < content.length) {
    const textContent = content.slice(lastIndex);
    if (textContent.trim()) {
      parts.push({ type: 'text', content: textContent, inline: true });
    }
  }
  
  return parts;
};

const LatexOrText: React.FC<LatexOrTextProps> = ({ content, inline = true, textStyle, color }) => {
  const hasLatex = /\\\(|\\\)|\\\[|\\\]/.test(content);
  
  const hasChemicalFormula = /[A-Z][a-z]?\d+[A-Z]|[A-Z][a-z]?\d+[_{]|[A-Z][a-z]?\d+|[A-Z][a-z]?[+-]|\\(rightleftharpoons|rightarrow|leftarrow\\)/.test(content);
  const hasFraction = /\\frac\{[^}]+\}\{[^}]+\}/.test(content);
  
  const hasMathSubscript = /_{[^}]+}|\^\{[^}]+\}/.test(content);

  
  const hasCommonTextPatterns = /[a-z]+_[a-z]+|\s+_\s+|\s+\^\s+/.test(content);

  
  const hasSubscriptPattern = /_{[^}]+}|_[0-9a-zA-Z]/.test(content);
  const hasSuperscriptPattern = /\^{[^}]+}|\^[0-9a-zA-Z]/.test(content);
  
  
  
  if (!hasLatex && !hasCommonTextPatterns && (hasChemicalFormula || hasFraction || hasMathSubscript || hasSubscriptPattern || hasSuperscriptPattern)) {
    const processedContent = latexToText(content);
    return (
      <Text style={[styles.text, textStyle, color ? { color } : {}]}>
        <Text style={[styles.math, styles.inlineMath, color ? { color } : {}]}>
          {processedContent}
        </Text>
      </Text>
    );
  }

  if (!hasLatex) {
    
    if (hasSubscriptPattern || hasSuperscriptPattern) {
      const processedContent = latexToText(content);
      return (
        <Text style={[styles.text, textStyle, color ? { color } : {}]}>
          {processedContent}
        </Text>
      );
    }
    return <Text style={[styles.text, textStyle, color ? { color } : {}]}>{content}</Text>;
  }

  const parts = parseMixedContent(content);

  return (
    <Text style={[styles.text, textStyle]}>
      {parts.map((part, index) => {
        const uniqueKey = `${part.type}-${index}-${part.content.length}-${part.content.charCodeAt(0)}-${part.content.charCodeAt(part.content.length - 1)}`;
        
        if (part.type === 'latex') {
          return (
            <Text key={uniqueKey} style={[styles.math, part.inline ? styles.inlineMath : styles.blockMath, color ? { color } : {}]}>
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

export default LatexOrText;
