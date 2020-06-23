import * as readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

interface VisitFunc {
  (ast: AST): number | never
}

enum TokenType {
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

class Token {
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

class Lexer {
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

abstract class AST {}

class BinOp extends AST {
  private token: Token
  constructor(readonly left: AST, readonly op: Token, readonly right: AST) {
    super()
    this.token = op
  }
}

class Num extends AST {
  private token: Token
  readonly value: number
  constructor(token: Token) {
    super()
    this.token = token
    this.value = token.value as number
  }
}

class Parser {
  private lexer: Lexer
  private currentToken: Token
  constructor(lexer: Lexer) {
    this.lexer = lexer
    this.currentToken = this.lexer.getNextToken()
  }

  error() {
    throw Error('Invalid syntax')
  }

  eat(tokenType: TokenType) {
    if (this.currentToken.type === tokenType) {
      this.currentToken = this.lexer.getNextToken()
    } else {
      this.error()
    }
  }

  factor(): AST {
    const token = this.currentToken
    if (token.type === TokenType.INTEGER) {
      this.eat(TokenType.INTEGER)
      return new Num(token)
    } else if (token.type === TokenType.LPAREN) {
      this.eat(TokenType.LPAREN)
      const node = this.expr()
      this.eat(TokenType.RPAREN)
      return node
    }
  }

  term(): AST {
    let node = this.factor()
    while (([TokenType.MUL, TokenType.DIV].indexOf(this.currentToken.type) >= 0)) {
      const token = this.currentToken
      if (token.type === TokenType.MUL) {
        this.eat(TokenType.MUL)
      } else if (token.type === TokenType.DIV) {
        this.eat(TokenType.DIV)
      }
      node = new BinOp(node, token, this.factor())
    }
    return node
  }

  expr(): AST {
    let node = this.term()
    while ([TokenType.PLUS, TokenType.MINUS].indexOf(this.currentToken.type) >= 0) {
      const token = this.currentToken
      if (token.type === TokenType.PLUS) {
        this.eat(TokenType.PLUS)
      } else if (token.type === TokenType.MINUS) {
        this.eat(TokenType.MINUS)
      }
      node = new BinOp(node, token, this.term())
    }
    return node
  }

  parse(): AST {
    return this.expr()
  }
}

class NodeVisitor {
  visit(node: AST): number {
    const methodName = 'visit' + node.constructor.name
    const visitor: VisitFunc = this[methodName] || this.genericVisit
    return visitor.call(this, node)
  }

  genericVisit(node: AST): never {
    throw Error(`No visit${node.constructor.name} method`)
  }
}

class Interpreter extends NodeVisitor {
  private parser: Parser
  constructor(parser: Parser) {
    super()
    this.parser = parser
  }

  visitBinOp(node: BinOp): number {
    if (node.op.type === TokenType.PLUS) {
      return this.visit(node.left) + this.visit(node.right)
    } else if (node.op.type === TokenType.MINUS) {
      return this.visit(node.left) - this.visit(node.right)
    } else if (node.op.type === TokenType.MUL) {
      return this.visit(node.left) * this.visit(node.right)
    } else if (node.op.type === TokenType.DIV) {
      return this.visit(node.left) / this.visit(node.right)
    }
  }

  visitNum(node: Num): number {
    return node.value
  }

  interpret(): number {
    const tree = this.parser.parse()
    return this.visit(tree)
  }
}

function main() {
  rl.on('line', (line) => {
    if (line) {
      const lexer = new Lexer(line)
      const parser = new Parser(lexer)
      const interpreter = new Interpreter(parser)
      const result = interpreter.interpret()
      console.log(result)
    }
  })
}

if (!module.parent) {
  main()
}
