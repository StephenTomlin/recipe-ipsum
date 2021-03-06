/* TODO make a more 'realistic' version
*  - limits on measurements
*  - different arrays for different types of ingredients
*  - Logical steps like beginning, middle, end, maybe not a choice of steps and go according to num of ingredients
*  - every ingredient must be used at least once in the steps
* */
import * as lists from './words';
import {decimalToFraction} from "./utils";
import {clipboardManager} from './clipboardManager';

const form = document.getElementById('generateRecipeForm');
const nbIngredientsInput = document.getElementById('nbIngredients');
const nbStepsInput = document.getElementById('nbSteps');
const seriousModeInput = document.getElementById('seriousMode');

const ingredientsRenderElem = document.getElementById('ingredientsRender');
const stepsRenderElem = document.getElementById('stepsRender');
const ingredientsHtmlList = document.createElement('ul');
const stepsHtmlList = document.createElement('ol');

nbIngredientsInput.setAttribute('max', lists.ingredients.length.toString());
nbStepsInput.setAttribute('max', lists.directions.length.toString());

const generateRecipe = (event) => {
    event.preventDefault();
    ingredientsHtmlList.innerHTML = '';
    stepsHtmlList.innerHTML = '';

    const nbIngredients = parseInt(nbIngredientsInput.value, 10) || Math.floor((Math.random() * 10) + 1);
    const nbSteps = parseInt(nbStepsInput.value, 10) || Math.floor((Math.random() * 5) + 1);

    const ingredients = generateIngredients(nbIngredients, seriousModeInput.checked);
    const steps = generateSteps(lists.directions, nbSteps, ingredients);

    ingredients.forEach(ingredient => {
        ingredientsHtmlList.innerHTML += `<li>${ingredient.amount} of ${ingredient.ingredient.name}</li>`
    });

    steps.forEach(step => {
        stepsHtmlList.innerHTML += `<li>${step}</li>`
    });

    ingredientsRenderElem.appendChild(ingredientsHtmlList);
    stepsRenderElem.appendChild(stepsHtmlList);
    document.querySelector('.recipe').classList.remove('hidden')
};

const generateIngredients = (nbIngredients, isSeriousMode) => {
    let ingredients = [];
    let ingredientListCopy = [...lists.ingredients];
    const chosenIngredientTypes = {};

    for (let i = 0; i < nbIngredients; i++) {
        const randomMeasurement = generateMeasurement(lists.decimals.random());
        let randomMeasurementType = lists.measurements.random();
        let ingredientIndex = -1;
        let randomIngredient;

        randomMeasurementType = (typeof randomMeasurement === 'number' && randomMeasurement > 1) 
            || (typeof randomMeasurement === 'string' && randomMeasurement.includes(' ')) 
                ? randomMeasurementType + 's' 
                : randomMeasurementType;

        if (!ingredientListCopy.length) {
            ingredientListCopy = [...lists.ingredients];
        }

        if (isSeriousMode) {
            randomIngredient = ingredientListCopy.find(({ type }, index) => {
                if (!chosenIngredientTypes[type]) {
                    chosenIngredientTypes[type] = true;
                    ingredientIndex = index;

                    return true;
                }

                return false;
            });
        }

        if (ingredientIndex === -1) {
            randomIngredient = ingredientListCopy.random();
            ingredientIndex = ingredientListCopy.indexOf(randomIngredient);
        }

        if (ingredientIndex > -1) {
            ingredientListCopy.splice(ingredientIndex, 1);
        }

        ingredients.push({
            amount: convertMeasurement(`${randomMeasurement} ${randomMeasurementType}`),
            ingredient: randomIngredient
        });
    }

    return ingredients;
};

const convertMeasurement = (measurement) => {
    if (measurement === '3 teaspoons') {
        return '1 tablespoon';
    } else if (measurement === '4 tablespoons' || measurement === '12 teaspoons') {
        return '1/4 cup';
    } else if (measurement === '16 tablespoons') {
        return '1 cup'; 
    } else if (measurement === '2 cups') {
        return '1 pint';
    } else if (measurement === '2 pints' || measurement === '4 cups') {
        return '1 quart';
    } else {
        return measurement;
    }
}

const generateMeasurement = measurement => {
    let newMeasurement = measurement;
    let randomInt = Math.floor((Math.random() * 5) + 1);
    let fraction = decimalToFraction(measurement);

    // This makes it to have whole numbers with fractions like 2 1/2 cups of milk
    if (Math.floor(Math.random() * 2) === 0) {
        newMeasurement = measurement === 0 ? randomInt : fraction;
    } else {
        newMeasurement = measurement === 0 ? randomInt  : `${randomInt.toString()} ${fraction}`;
    }

    return newMeasurement;
};

const generateSteps = (directions, nbSteps, ingredients) => {
    const steps = [];
    const stepListCopy = [...directions];

    for (let i = 0; i < nbSteps; i++) {
        let randomStep = stepListCopy.random();
        const stepIndex = stepListCopy.indexOf(randomStep);

        if (stepIndex > -1) {
            stepListCopy.splice(stepIndex, 1);
        }

        if (randomStep.includes('{ingredient}')) {
            randomStep = replaceIngredientPlaceholder(randomStep, ingredients);
        }

        steps.push(randomStep)
    }

    return steps;
};

const replaceIngredientPlaceholder = (step, ingredients) => {
    const split = step.split(' ');
    for (let i = 0; i < split.length; i++) {
        if (split[i].includes('{ingredient}')) {
            split[i] = split[i].replace(/{ingredient}/, ingredients.random().ingredient.name);
        }
    }

    return split.join(' ');
};

clipboardManager();
form.addEventListener('submit', generateRecipe);
