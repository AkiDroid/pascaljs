import { Lexer } from './src/lexer'
import { Parser } from './src/parser'
import { Interpreter } from './src/interpreter'

const text = `
BEGIN
    BEGIN
        number := 2;
        a := number;
        b := 10 * a + 10 * number / 4;
        c := a - - b
    END;
    x := 11;
END.
`

const lexer = new Lexer(text)
const parser = new Parser(lexer)
const interpreter = new Interpreter(parser)
interpreter.interpret()
console.log(interpreter.GLOBAL_SCOPE)
