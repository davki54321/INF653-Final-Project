
const State = require('../model/States');
const data = {};
data.states = require('../model/statesData.json');


const validateStatesFromJson = async (req, res, next) => {

    if (!data.states) {
        return res.status(204).json({ 'message': 'No states found.' });
    }

    next();
}

const validateStateFromJson = async (req, res, next) => {
    
    const state = await State.findOne({ stateCode: req.params.state.toUpperCase() }).exec();

    // If an invalid state code was given, then status 204 is returned.
    if (!state) {
        return res.status(400).json({ 'message': 'Invalid state abbreviation parameter' });
    }

    next();
}

const validateFunFactsFromJson = async (req, res, next) => {
    
    const code = req.params.state.toUpperCase();
    const state = await State.findOne({ stateCode: code }).exec();
    const funFacts = state["funfacts"];

    // If the state does not have any fun facts, status 400 is sent.
    if (funFacts.length === 0) {

        const stateFromJson = await data.states.find(stateObj => stateObj.code === code);
        return res.status(404).json({ 'message': `No Fun Facts found for ${stateFromJson.state}` });
    }

    next();
}

const validateFunFactsFromBody = async (req, res, next) => {
    
    // This is the array of new fun facts to be added.
    const newFunFacts = req.body.funfacts;

    // If no fun facts were in the body, then status 400 is sent.
    if (!newFunFacts) {
        return res.status(400).json({'message': "State fun facts value required"});
    }
    
    // If the body of funfacts is not an array, status 400 is returned.
    if(!Array.isArray(newFunFacts)) {
        return res.status(400).json({'message': "State fun facts value must be an array"});
    }

    next();
}

const validateIndexFromBody = async (req, res, next) => {

    // This is NOT zero indexed. If index is 1, then the first element in the array will be removed.
    const index = await req.body.index;

    // If an index is not included in the body of the request, status 400 is returned.
    if (!index || index === undefined) {
        return res.status(400).json({ 'message': 'State fun fact index value required' });
    }

    next();
}

const validateIndexExistsInJson = async (req, res, next) => {

    const code = req.params.state.toUpperCase();
    const state = await State.findOne({ stateCode: code }).exec();
    const index = await req.body.index;

    // If the state has no fun facts, status 404 is returned.
    if (!state.funfacts.length > 0) {
        const stateFromJson = data.states.find(stateObj => stateObj.code === code);
        return res.status(404).json({ 'message': `No Fun Facts found for ${stateFromJson.state}` });
    }    

    // If the index is not in the array, status 400 is sent.
    if (index > state.funfacts.length || index < 0) {
        const stateJSON = data.states.find(stateObj => stateObj.code === code);
        return res.status(400).json({ 'message': `No Fun Fact found at that index for ${stateJSON.state}` });
    }

    next();
}


module.exports = {
    validateStatesFromJson,
    validateStateFromJson,
    validateFunFactsFromJson,
    validateFunFactsFromBody,
    validateIndexFromBody,
    validateIndexExistsInJson
}