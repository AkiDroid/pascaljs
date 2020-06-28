
import {
  AST, BinOp, UnaryOp, Num, Compound, Assign,
  Var, NoOp, Program, Block, Type, VarDecl, ProcedureDecl
} from './ast'
import { Parser, VisitFunc } from './parser'
import { TokenType } from './lexer'

interface GlobalScope {
  [index: string]: number
}

class NodeVisitor {
  visit(node: AST) {
    const methodName = `visit${node.constructor.name}`
    const visitor: VisitFunc = this[methodName] || this.genericVisit
    return visitor.call(this, node)
  }

  genericVisit(node: AST): never {
    throw Error(`No visit${node.constructor.name} method`)
  }
}

export class Interpreter extends NodeVisitor {
  private parser: Parser
  readonly GLOBAL_SCOPE: GlobalScope
  constructor(parser: Parser) {
    super()
    this.parser = parser
    this.GLOBAL_SCOPE = {}
  }

  visitProgram(node: Program) {
    this.visit(node.block)
  }

  visitBlock(node: Block) {
    for (const declaration of node.declarations) {
      this.visit(declaration)
    }
    this.visit(node.compoundStatement)
  }

  visitVarDecl(node: VarDecl) {

  }

  visitType(node: Type) {

  }

  visitCompound(node: Compound): void {
    for (const child of node.children) {
      this.visit(child)
    }
  }

  visitNoOp() {

  }

  visitAssign(node: Assign) {
    const varName = node.left.value
    this.GLOBAL_SCOPE[varName] = this.visit(node.right)
  }

  visitVar(node: Var): number {
    const varName = node.value
    const val = this.GLOBAL_SCOPE[varName]
    if (val === undefined) {
      throw Error(`NameError: ${varName}`)
    } else {
      return val
    }
  }

  visitBinOp(node: BinOp): number {
    if (node.op.type === TokenType.PLUS) {
      return this.visit(node.left) + this.visit(node.right)
    } else if (node.op.type === TokenType.MINUS) {
      return this.visit(node.left) - this.visit(node.right)
    } else if (node.op.type === TokenType.MUL) {
      return this.visit(node.left) * this.visit(node.right)
    } else if (node.op.type === TokenType.FLOAT_DIV) {
      return this.visit(node.left) / this.visit(node.right)
    } else if (node.op.type === TokenType.INTEGER_DIV) {
      return Math.floor(this.visit(node.left) / this.visit(node.right))
    }
  }

  visitProcedureDecl(node: ProcedureDecl) {

  }

  visitUnaryOp(node: UnaryOp): number {
    const opType = node.op.type
    if (opType === TokenType.PLUS) {
      return this.visit(node.expr)
    } else if (opType === TokenType.MINUS) {
      return -this.visit(node.expr)
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
