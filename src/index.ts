
import * as readline from 'readline'
import { Lexer } from './lexer'
import { Parser } from './parser'
import { Interpreter } from './interpreter'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

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
