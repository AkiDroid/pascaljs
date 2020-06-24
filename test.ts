import { Lexer } from './src/lexer'
import { Parser } from './src/parser'
import { Interpreter } from './src/interpreter'

const text = `
BEGIN

    BEGIN
      a := 10 / 3;
      b := 10 diV 3;
    end;

    x := 11;
END.
`

const lexer = new Lexer(text)
const parser = new Parser(lexer)
const interpreter = new Interpreter(parser)
interpreter.interpret()
console.log(interpreter.GLOBAL_SCOPE)
