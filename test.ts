import { Lexer } from './src/lexer'
import { Parser } from './src/parser'
import { Interpreter } from './src/interpreter'

const text = `
program Main;
   var x, y : integer;

begin
    x := x + y;
end.
`

const lexer = new Lexer(text)
const parser = new Parser(lexer)
const interpreter = new Interpreter(parser)
interpreter.interpret()
console.log(interpreter.GLOBAL_SCOPE)

class Animal {
  name: string
  constructor(name: string) {
    this.name = name
  }
}

class Dog extends Animal {
  private category: string
  constructor(name: string, category: string) {
    super(name)
    this.category = category
  }
}
