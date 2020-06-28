import { Token, Lexer, TokenType } from './lexer'

export abstract class AST {}

export class Program extends AST {
  constructor(readonly name: Var, readonly block: Block) {
    super()
  }
}

export class Block extends AST {
  constructor(readonly declarations: VarDecl[], readonly compoundStatement: Compound) {
    super()
  }
}

export class VarDecl extends AST {
  constructor(readonly varNode: Var, readonly typeNode: Type) {
    super()
  }
}

export class Type extends AST {
  readonly value: string
  constructor(readonly token: Token) {
    super()
  }
}

export class BinOp extends AST {
  private token: Token
  constructor(readonly left: UnaryOp|Num|Var|BinOp, readonly op: Token, readonly right: UnaryOp|Num|Var|BinOp) {
    super()
    this.token = op
  }
}

export class UnaryOp extends AST {
  private token: Token
  constructor(readonly op: Token, readonly expr: UnaryOp|Num|Var|BinOp) {
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

export class Compound extends AST {
  children: (Compound|Assign|NoOp)[]
  constructor() {
    super()
    this.children = []
  }
}

export class Assign extends AST {
  token: Token
  constructor(readonly left: Var, op: Token, readonly right: UnaryOp|Num|Var|BinOp) {
    super()
  }
}

export class Var extends AST {
  token: Token
  value: string
  constructor(token: Token) {
    super()
    this.token = token
    this.value = token.value as string
  }
}

export class ProcedureDecl extends AST {
  constructor(public procName: string, public blockNode: AST) {
    super()
  }
}

export class NoOp extends AST {
}
