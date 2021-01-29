import { Rational } from "./rational.js"

class Assembler {
    constructor(key, name, rate) {
        this.key = key
        this.name = name
        this.rate = rate
    }
    iconPath() {
        return "images/" + this.name + ".png"
    }
}

export function getAssemblers(data) {
    let assemblers = new Map()
    for (let assembler of data.assemblers) {
        assemblers.set(assembler.key_name, new Assembler(
            assembler.key_name,
            assembler.name,
            Rational.from_float(assembler.rate)
        ))
    }
    return assemblers
}
