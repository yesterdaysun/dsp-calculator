/*Copyright 2019 Kirk McDonald

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.*/
import {DEFAULT_RATE, DEFAULT_RATE_PRECISION, DEFAULT_COUNT_PRECISION, longRateNames} from "./align.js"
import {dropdown} from "./dropdown.js"
import {DEFAULT_TAB, clickTab} from "./events.js"
import {spec, resourcePurities, DEFAULT_BELT, DEFAULT_ASSEMBLER, DEFAULT_SMELTER} from "./factory.js"
import {Rational} from "./rational.js"

// There are several things going on with this control flow. Settings should
// work like this:
// 1) Settings are parsed from the URL fragment into the settings Map.
// 2) Each setting's `render` function is called.
// 3) If the setting is not present in the map, a default value is used.
// 4) The setting is applied.
// 5) The setting's GUI is placed into a consistent state.
// Remember to add the setting to fragment.js, too!

// tab

function renderTab(settings) {
    let tabName = DEFAULT_TAB
    if (settings.has("tab")) {
        tabName = settings.get("tab")
    }
    clickTab(tabName)
}

// build targets

function renderTargets(settings) {
    spec.buildTargets = []
    d3.select("#targets li.target").remove()

    let targetSetting = settings.get("items")
    if (targetSetting !== undefined && targetSetting !== "") {
        let targets = targetSetting.split(",")
        for (let targetString of targets) {
            let parts = targetString.split(":")
            let itemKey = parts[0]
            let target = spec.addTarget(itemKey)
            let type = parts[1]
            if (type === "f") {
                target.setBuildings(parts[2])
            } else if (type === "r") {
                target.setRate(parts[2])
            } else {
                throw new Error("unknown target type")
            }
        }
    } else {
        spec.addTarget()
    }
}

// ignore

function renderIgnore(settings) {
    spec.ignore.clear()
    // UI will be rendered later, as part of the solution.
    let ignoreSetting = settings.get("ignore")
    if (ignoreSetting !== undefined && ignoreSetting !== "") {
        let ignore = ignoreSetting.split(",")
        for (let recipeKey of ignore) {
            let recipe = spec.recipes.get(recipeKey)
            spec.ignore.add(recipe)
        }
    }
}

// overclock

function renderOverclock(settings) {
    spec.overclock.clear()
    // UI will be rendered later, as part of the solution.
    let overclockSetting = settings.get("overclock")
    if (overclockSetting !== undefined && overclockSetting !== "") {
        let overclock = overclockSetting.split(",")
        for (let pair of overclock) {
            let [recipeKey, percentString] = pair.split(":")
            let recipe = spec.recipes.get(recipeKey)
            let percent = Rational.from_string(percentString).div(Rational.from_float(100))
            spec.setOverclock(recipe, percent)
        }
    }
}

// display rate

function rateHandler() {
    spec.format.setDisplayRate(this.value)
    spec.updateSolution()
}

function renderRateOptions(settings) {
    let rateName = DEFAULT_RATE
    if (settings.has("rate")) {
        rateName = settings.get("rate")
    }
    spec.format.setDisplayRate(rateName)
    let rates = []
    for (let [rateName, longRateName] of longRateNames) {
        rates.push({rateName, longRateName})
    }
    let form = d3.select("#display_rate")
    form.selectAll("*").remove()
    let rateOption = form.selectAll("span")
        .data(rates)
        .join("span")
    rateOption.append("input")
        .attr("id", d => d.rateName + "_rate")
        .attr("type", "radio")
        .attr("name", "rate")
        .attr("value", d => d.rateName)
        .attr("checked", d => d.rateName === rateName ? "" : null)
        .on("change", rateHandler)
    rateOption.append("label")
        .attr("for", d => d.rateName + "_rate")
        .text(d => "items/" + d.longRateName)
    rateOption.append("br")
}

// precisions

function renderPrecisions(settings) {
    spec.format.ratePrecision = DEFAULT_RATE_PRECISION
    if (settings.has("rp")) {
        spec.format.ratePrecision = Number(settings.get("rp"))
    }
    d3.select("#rprec").attr("value", spec.format.ratePrecision)
    spec.format.countPrecision = DEFAULT_COUNT_PRECISION
    if (settings.has("cp")) {
        spec.format.countPrecision = Number(settings.get("cp"))
    }
    d3.select("#cprec").attr("value", spec.format.countPrecision)
}

// belt

function beltHandler(belt) {
    spec.belt = belt
    spec.updateSolution()
}

function renderBelts(settings) {
    let beltKey = DEFAULT_BELT
    if (settings.has("belt")) {
        beltKey = settings.get("belt")
    }
    spec.belt = spec.belts.get(beltKey)

    let belts = []
    for (let [beltKey, belt] of spec.belts) {
        belts.push(belt)
    }
    let form = d3.select("#belt_selector")
    form.selectAll("*").remove()
    let beltOption = form.selectAll("span")
        .data(belts)
        .join("span")
    beltOption.append("input")
        .attr("id", d => "belt." + d.key)
        .attr("type", "radio")
        .attr("name", "belt")
        .attr("value", d => d.key)
        .attr("checked", d => d === spec.belt ? "" : null)
        .on("change", beltHandler)
    beltOption.append("label")
        .attr("for", d => "belt." + d.key)
        .append("img")
        .classed("icon", true)
        .attr("src", d => d.iconPath())
        .attr("width", 32)
        .attr("height", 32)
        .attr("title", d => d.name)
}

// assembler

function assemblerHandler(assembler) {
    spec.assembler = assembler
    spec.updateSolution()
}



function renderAssemblers(settings) {
    let assemblerKey = DEFAULT_ASSEMBLER
    if (settings.has("assembler")) {
        assemblerKey = settings.get("assembler")
    }
    spec.assembler = spec.assemblers.get(assemblerKey)

    let assemblers = []
    for (let [assemblerKey, assembler] of spec.assemblers) {
        assemblers.push(assembler)
    }
    let form = d3.select("#assembler_selector")
    form.selectAll("*").remove()
    let assemblerOption = form.selectAll("span")
        .data(assemblers)
        .join("span")
    assemblerOption.append("input")
        .attr("id", d => "assembler." + d.key)
        .attr("type", "radio")
        .attr("name", "assembler")
        .attr("value", d => d.key)
        .attr("checked", d => d === spec.assembler ? "" : null)
        .on("change", assemblerHandler)
    assemblerOption.append("label")
        .attr("for", d => "assembler." + d.key)
        .append("img")
        .classed("icon", true)
        .attr("src", d => d.iconPath())
        .attr("width", 32)
        .attr("height", 32)
        .attr("title", d => d.name)
}

// smelters

function smelterHandler(smelter) {
    spec.smelter = smelter
    spec.updateSolution()
}

function renderSmelters(settings) {
    let smelterKey = DEFAULT_SMELTER
    if (settings.has("smelter")) {
        smelterKey = settings.get("smelter")
    }
    spec.smelter = spec.smelters.get(smelterKey)

    let smelters = []
    for (let [smelterKey, smelter] of spec.smelters) {
        smelters.push(smelter)
    }
    let form = d3.select("#smelting_selector")
    form.selectAll("*").remove()
    let smelterOption = form.selectAll("span")
        .data(smelters)
        .join("span")
    smelterOption.append("input")
        .attr("id", d => "smelter." + d.key)
        .attr("type", "radio")
        .attr("name", "smelter")
        .attr("value", d => d.key)
        .attr("checked", d => d === spec.smelter ? "" : null)
        .on("change", smelterHandler)
    smelterOption.append("label")
        .attr("for", d => "smelter." + d.key)
        .append("img")
        .classed("icon", true)
        .attr("src", d => d.iconPath())
        .attr("width", 32)
        .attr("height", 32)
        .attr("title", d => d.name)
}

// alternate recipes

function changeAltRecipe(recipe) {
    spec.setRecipe(recipe)
    spec.updateSolution()
}

function renderIngredient(ingSpan) {
    ingSpan.classed("ingredient", true)
        .attr("title", d => d.item.name)
        .append("img")
        .classed("icon", true)
        .attr("src", d => d.item.iconPath())
    ingSpan.append("span")
        .classed("count", true)
        .text(d => spec.format.count(d.amount))
}

function renderAltRecipes(settings) {
    spec.altRecipes = new Map()
    if (settings.has("alt")) {
        let alt = settings.get("alt").split(",")
        for (let recipeKey of alt) {
            let recipe = spec.recipes.get(recipeKey)
            spec.setRecipe(recipe)
        }
    }

    let items = []
    for (let tier of spec.itemTiers) {
        for (let item of tier) {
            if (item.recipes.length > 1) {
                items.push(item)
            }
        }
    }

    let div = d3.select("#alt_recipe_settings")
    div.selectAll("*").remove()

    let dropdowns = div.selectAll("div")
        .data(items)
        .enter().append("div")
    let recipeLabel = dropdown(
        dropdowns,
        d => d.recipes,
        d => `altrecipe-${d.product.item.key}`,
        d => spec.getRecipe(d.product.item) === d,
        changeAltRecipe,
    )

    let productSpan = recipeLabel.append("span")
        .selectAll("span")
        .data(d => [d.product])
        .join("span")
    renderIngredient(productSpan)
    recipeLabel.append("span")
        .classed("arrow", true)
        .text("\u21d0")
    let ingredientSpan = recipeLabel.append("span")
        .selectAll("span")
        .data(d => d.ingredients)
        .join("span")
    renderIngredient(ingredientSpan)
}

// miners

function mineHandler(d) {
    spec.setMiner(d.recipe, d.miner, d.purity)
    spec.updateSolution()
}


export function renderSettings(settings) {
    renderTargets(settings)
    renderIgnore(settings)
    renderOverclock(settings)
    renderRateOptions(settings)
    renderPrecisions(settings)
    renderBelts(settings)
    renderAssemblers(settings)
    renderSmelters(settings)
    renderAltRecipes(settings)
    renderTab(settings)
}
