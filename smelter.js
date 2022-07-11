import {Rational} from "./rational.js"

class Smelter {
    constructor(key, name, rate) {
        this.key = key
        this.name = name
        this.rate = rate
    }

    iconPath() {
        return "images/" + this.name + ".png"
    }
}

export function getSmelters(data) {
    let smelters = new Map()
    for (let smelter of data.smelters) {
        smelters.set(smelter.key_name, new Smelter(
            smelter.key_name,
            smelter.name,
            Rational.from_float(smelter.rate)
        ))
    }
    return smelters
}
