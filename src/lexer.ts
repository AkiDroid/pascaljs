
export enum TokenType {
  INTEGER = 'INTEGER',
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  MUL = 'MULTIPLY',
  DIV = 'DIVIDE',
  LPAREN= 'LPAREN',
  RPAREN = 'RPAREN',
  EOF = 'EOF',
}

function isDigit(char: string): boolean {
  return '0123456789'.indexOf(char) >= 0
}

function isSpace(char: string): boolean {
  return ' \r\n\t'.indexOf(char) >= 0
}

export class Token {
  readonly type: TokenType
  readonly value: string | number

  constructor(type: TokenType, value: string|number) {
    this.type = type
    this.value = value
  }

  toString(a: number): string
  toString(a: number|string): string {
    return `Token(${this.type}, ${this.value})`
  }
}

export class Lexer {
  private text: string
  private pos: number
  private currentChar: string
  constructor(text: string) {
    this.text = text
    this.pos = 0
    this.currentChar = this.text[this.pos]
  }

  error() {
    throw Error('Invalid character')
  }

  advance() {
    this.pos += 1
    if (this.pos > this.text.length - 1) {
      this.currentChar = null
    } else {
      this.currentChar = this.text[this.pos]
    }
  }

  skipWhitespace() {
    while (this.currentChar && isSpace(this.currentChar)) {
      this.advance()
    }
  }

  integer(): number {
    let result = ''
    while (this.currentChar && isDigit(this.currentChar)) {
      result += this.currentChar
      this.advance()
    }
    return parseInt(result)
  }

  getNextToken() {
    while (this.currentChar) {
      if (isSpace(this.currentChar)) {
        this.skipWhitespace()
        continue
      }

      if (isDigit(this.currentChar)) {
        return new Token(TokenType.INTEGER, this.integer())
      }

      if (this.currentChar === '+') {
        this.advance()
        return new Token(TokenType.PLUS, '+')
      }

      if (this.currentChar === '-') {
        this.advance()
        return new Token(TokenType.MINUS, '-')
      }

      if (this.currentChar === '*') {
        this.advance()
        return new Token(TokenType.MUL, '*')
      }

      if (this.currentChar === '/') {
        this.advance()
        return new Token(TokenType.DIV, '/')
      }

      if (this.currentChar === '(') {
        this.advance()
        return new Token(TokenType.LPAREN, '(')
      }

      if (this.currentChar === ')') {
        this.advance()
        return new Token(TokenType.RPAREN, ')')
      }

      this.error()
    }
    return new Token(TokenType.EOF, null)
  }
}
