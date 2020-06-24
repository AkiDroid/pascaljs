import { Lexer } from './src/lexer'
import { Parser } from './src/parser'
import { Interpreter } from './src/interpreter'

const text = `
PROGRAM Part10;
VAR
   number     : INTEGER;
   a, b, c, x : INTEGER;
   y          : REAL;

BEGIN {Part10}
   BEGIN
      number := 2;
      a := number;
      b := 10 * a + 10 * number DIV 4;
      c := a - - b
   END;
   x := 11;
   y := 20 / 7 + 3.14;
   { writeln('a = ', a); }
   { writeln('b = ', b); }
   { writeln('c = ', c); }
   { writeln('number = ', number); }
   { writeln('x = ', x); }
   { writeln('y = ', y); }
END.  {Part10}
`

const lexer = new Lexer(text)
const parser = new Parser(lexer)
const interpreter = new Interpreter(parser)
interpreter.interpret()
console.log(interpreter.GLOBAL_SCOPE)

const a = [1, 2, 3]
const b = a.map((i) => {
  return String(i + 1)
})
