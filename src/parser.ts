
import { Token, Lexer, TokenType } from './lexer'

export interface VisitFunc {
  (ast: AST): number | never
}

export abstract class AST {}

export class BinOp extends AST {
  private token: Token
  constructor(readonly left: AST, readonly op: Token, readonly right: AST) {
    super()
    this.token = op
  }
}

export class UnaryOp extends AST {
  private token: Token
  constructor(readonly op: Token, readonly expr: AST) {
    super()
    this.token = op
  }
}

export class Num extends AST {
  private token: Token
  readonly value: number
  constructor(token: Token) {
    super()
    this.token = token
    this.value = token.value as number
  }
}

export class Parser {
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
    if (token.type === TokenType.PLUS) {
      this.eat(TokenType.PLUS)
      return new UnaryOp(token, this.factor())
    } else if (token.type === TokenType.MINUS) {
      this.eat(TokenType.MINUS)
      return new UnaryOp(token, this.factor())
    } else if (token.type === TokenType.INTEGER) {
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
