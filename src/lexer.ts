
function isAlpha(c: string) {
  return (((c >= 'a') && (c <= 'z')) || ((c >= 'A') && (c <= 'Z')))
}

function isUnderscore(c: string) {
  return c === '_'
}

function isDigit(c: string) {
  return ((c >= '0') && (c <= '9'))
}

function isAlnum(c: string) {
  return (isAlpha(c) || isDigit(c) || isUnderscore(c))
}

function isSpace(char: string): boolean {
  return ' \r\n\t'.indexOf(char) >= 0
}

export enum TokenType {
  PROGRAM = 'PROGRAM',
  VAR = 'VAR',
  INTEGER = 'INTEGER',
  REAL = 'REAL',
  INTEGER_CONST = 'INTEGER_CONST',
  REAL_CONST = 'REAL_CONST',
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  MUL = 'MULTIPLY',
  INTEGER_DIV = 'INTEGER_DIV',
  FLOAT_DIV = 'FLOAT_DIV',
  LPAREN= 'LPAREN',
  RPAREN = 'RPAREN',
  ID = 'ID',
  ASSIGN = 'ASSIGN',
  SEMI = 'SEMI',
  DOT = 'DOT',
  BEGIN = 'BEGIN',
  END = 'END',
  COLON = 'COLON',
  COMMA = 'COMMA',
  PROCEDURE = 'PROCEDURE',
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
  PROGRAM: new Token(TokenType.PROGRAM, 'PROGRAM'),
  VAR: new Token(TokenType.VAR, 'VAR'),
  INTEGER: new Token(TokenType.INTEGER, 'INTEGER'),
  REAL: new Token(TokenType.REAL, 'REAL'),
  BEGIN: new Token(TokenType.BEGIN, 'BEGIN'),
  END: new Token(TokenType.END, 'END'),
  DIV: new Token(TokenType.INTEGER_DIV, 'DIV'),
  PROCEDURE: new Token(TokenType.PROCEDURE, 'PROCEDURE')
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
    throw Error(`Invalid character: ${this.currentChar}`)
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

  skipComment() {
    while (this.currentChar !== '}') {
      this.advance()
    }
    this.advance()
  }

  number(): Token {
    let result = ''
    let token: Token

    while (this.currentChar && isDigit(this.currentChar)) {
      result += this.currentChar
      this.advance()
    }

    if (this.currentChar === '.') {
      result += this.currentChar
      this.advance()
      while (this.currentChar && isDigit(this.currentChar)) {
        result += this.currentChar
        this.advance()
      }
      token = new Token(TokenType.REAL_CONST, parseFloat(result))
    } else {
      token = new Token(TokenType.INTEGER_CONST, parseInt(result))
    }
    return token
  }

  _id(): Token {
    let result = ''
    while (this.currentChar && isAlnum(this.currentChar)) {
      result += this.currentChar
      this.advance()
    }
    const token = RESERVED_KEYWORDS[result.toUpperCase()] || new Token(TokenType.ID, result.toLowerCase())
    return token
  }

  getNextToken(): Token {
    while (this.currentChar) {
      if (isSpace(this.currentChar)) {
        this.skipWhitespace()
        continue
      }

      if (isDigit(this.currentChar)) {
        return this.number()
      }

      if (isAlpha(this.currentChar) || isUnderscore(this.currentChar)) {
        return this._id()
      }

      if (this.currentChar === '{') {
        this.advance()
        this.skipComment()
        continue
      }

      if (this.currentChar === ',') {
        this.advance()
        return new Token(TokenType.COMMA, ',')
      }

      if (this.currentChar === ':' && this.peek() === '=') {
        this.advance()
        this.advance()
        return new Token(TokenType.ASSIGN, ':=')
      }

      if (this.currentChar === ':') {
        this.advance()
        return new Token(TokenType.COLON, ':')
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
        return new Token(TokenType.FLOAT_DIV, 'DIV')
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
