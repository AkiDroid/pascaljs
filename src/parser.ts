
import { Token, Lexer, TokenType } from './lexer'

export interface VisitFunc {
  (ast: AST): number | never
}

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

export class NoOp extends AST {
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

  program(): Program {
    // program : PROGRAM variable SEMI block DOT
    this.eat(TokenType.PROGRAM)
    const varNode = this.variable()
    this.eat(TokenType.SEMI)
    const blockNode = this.block()
    const node = new Program(varNode, blockNode)
    this.eat(TokenType.DOT)
    return node
  }

  block(): Block {
    // block : declarations compound_statement
    const declarationNodes = this.declarations()
    const compoundStatementNode = this.compoundStatement()
    const node = new Block(declarationNodes, compoundStatementNode)
    return node
  }

  declarations(): VarDecl[] {
    /*
    declarations : VAR (variable_declaration SEMI)+
                 | empty
    */
    let declarations = []
    const token = this.currentToken
    if (token.type === TokenType.VAR) {
      this.eat(TokenType.VAR)
      while (this.currentToken.type === TokenType.ID) {
        const varDecl = this.variableDeclaration()
        declarations = declarations.concat(varDecl)
        this.eat(TokenType.SEMI)
      }
    }

    return declarations
  }

  variableDeclaration(): VarDecl[] {
    // variable_declaration : ID (COMMA ID)* COLON type_spec
    const varNodes = [new Var(this.currentToken)]
    this.eat(TokenType.ID)
    while (this.currentToken.type === TokenType.COMMA) {
      this.eat(TokenType.COMMA)
      varNodes.push(new Var(this.currentToken))
      this.eat(TokenType.ID)
    }
    this.eat(TokenType.COLON)

    const typeNode = this.typeSpec()

    const varDeclarations: VarDecl[] = []
    for (const varNode of varNodes) {
      varDeclarations.push(new VarDecl(varNode, typeNode))
    }
    return varDeclarations
  }

  typeSpec(): Type {
    /*
    type_spec : INTEGER
              | REAL
    */
    const token = this.currentToken
    if (this.currentToken.type === TokenType.INTEGER) {
      this.eat(TokenType.INTEGER)
    } else {
      this.eat(TokenType.REAL)
    }
    const node = new Type(token)
    return node
  }

  compoundStatement(): Compound {
    /*
    compound_statement : BEGIN statement_list END
    */
    this.eat(TokenType.BEGIN)
    const nodes = this.statementList()
    this.eat(TokenType.END)
    const root = new Compound()
    for (const node of nodes) {
      root.children.push(node)
    }
    return root
  }

  statementList(): (Compound|Assign|NoOp)[] {
    /*
    statementList : statement
                  | statement SEMI statement_list
     */
    const node = this.statement()
    const result = [node]
    while (this.currentToken.type === TokenType.SEMI) {
      this.eat(TokenType.SEMI)
      result.push(this.statement())
    }

    // why?
    if (this.currentToken.type === TokenType.ID) {
      this.error()
    }

    return result
  }

  statement(): Compound|Assign|NoOp {
    /*
    statement : compoundStatement
              | assignmentStatement
              | empty
    */

    let node: AST
    if (this.currentToken.type === TokenType.BEGIN) {
      node = this.compoundStatement()
    } else if (this.currentToken.type === TokenType.ID) {
      node = this.assignmentStatement()
    } else {
      node = this.empty()
    }
    return node
  }

  assignmentStatement(): Assign {
    /*
    assignmentStatement : variable ASSIGN expr
    */
    const left = this.variable()
    const token = this.currentToken
    this.eat(TokenType.ASSIGN)
    const right = this.expr()
    const node = new Assign(left, token, right)
    return node
  }

  variable(): Var {
    /*
    variable: ID
    */
    const node = new Var(this.currentToken)
    this.eat(TokenType.ID)
    return node
  }

  empty(): NoOp {
    return new NoOp()
  }

  factor(): UnaryOp|Num|Var|BinOp {
    /*
    factor : PLUS  factor
          | MINUS factor
          | INTEGER_CONST
          | REAL_CONST
          | LPAREN expr RPAREN
          | variable
    */
    const token = this.currentToken
    if (token.type === TokenType.PLUS) {
      this.eat(TokenType.PLUS)
      return new UnaryOp(token, this.factor())
    } else if (token.type === TokenType.MINUS) {
      this.eat(TokenType.MINUS)
      return new UnaryOp(token, this.factor())
    } else if (token.type === TokenType.INTEGER_CONST) {
      this.eat(TokenType.INTEGER_CONST)
      return new Num(token)
    } else if (token.type === TokenType.REAL_CONST) {
      this.eat(TokenType.REAL_CONST)
      return new Num(token)
    } else if (token.type === TokenType.LPAREN) {
      this.eat(TokenType.LPAREN)
      const node = this.expr()
      this.eat(TokenType.RPAREN)
      return node
    } else {
      const node = this.variable()
      return node
    }
  }

  term(): UnaryOp|Num|Var|BinOp {
    // term : factor ((MUL | INTEGER_DIV | FLOAT_DIV) factor)*
    let node = this.factor()
    while (([
      TokenType.MUL,
      TokenType.INTEGER_DIV,
      TokenType.FLOAT_DIV].indexOf(this.currentToken.type) >= 0)) {
      const token = this.currentToken
      if (token.type === TokenType.MUL) {
        this.eat(TokenType.MUL)
      } else if (token.type === TokenType.INTEGER_DIV) {
        this.eat(TokenType.INTEGER_DIV)
      } else if (token.type === TokenType.FLOAT_DIV) {
        this.eat(TokenType.FLOAT_DIV)
      }
      node = new BinOp(node, token, this.factor())
    }
    return node
  }

  expr(): UnaryOp|Num|Var|BinOp {
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

  parse(): Compound {
    const node = this.program()
    if (this.currentToken.type !== TokenType.EOF) {
      this.error()
    }
    return node
  }
}
