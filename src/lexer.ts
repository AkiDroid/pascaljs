
function isAlpha(c: string) {
  return (((c >= 'a') && (c <= 'z')) || ((c >= 'A') && (c <= 'Z')))
}

function isDigit(c: string) {
  return ((c >= '0') && (c <= '9'))
}

function isAlnum(c: string) {
  return (isAlpha(c) || isDigit(c))
}

function isSpace(char: string): boolean {
  return ' \r\n\t'.indexOf(char) >= 0
}

export enum TokenType {
  INTEGER = 'INTEGER',
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  MUL = 'MULTIPLY',
  DIV = 'DIVIDE',
  LPAREN= 'LPAREN',
  RPAREN = 'RPAREN',
  ID = 'ID',
  ASSIGN = 'ASSIGN',
  SEMI = 'SEMI',
  DOT = 'DOT',
  BEGIN = 'BEGIN',
  END = 'END',
  EOF = 'EOF',
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

const RESERVED_KEYWORDS = {
  BEGIN: new Token(TokenType.BEGIN, 'BEGIN'),
  END: new Token(TokenType.END, 'END')
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

  peek(): string {
    const peekPos = this.pos + 1
    if (peekPos > this.text.length - 1) {
      return null
    } else {
      return this.text[peekPos]
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

  _id() {
    let result = ''
    while (this.currentChar && isAlnum(this.currentChar)) {
      result += this.currentChar
      this.advance()
    }
    const token = RESERVED_KEYWORDS[result] || new Token(TokenType.ID, result)
    return token
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

      if (isAlpha(this.currentChar)) {
        return this._id()
      }

      if (this.currentChar === ':' && this.peek() === '=') {
        this.advance()
        this.advance()
        return new Token(TokenType.ASSIGN, ':=')
      }

      if (this.currentChar === ';') {
        this.advance()
        return new Token(TokenType.SEMI, ';')
      }

      if (this.currentChar === '.') {
        this.advance()
        return new Token(TokenType.DOT, '.')
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
