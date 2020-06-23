
import { AST, Parser, VisitFunc, BinOp, UnaryOp, Num } from './parser'
import { TokenType } from './lexer'

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
