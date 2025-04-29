
const State = require('../model/States');
const data = {};
data.states = require('../model/statesData.json');

const getAllStates = async (req, res) => {
    
    // // If states data is not in the JSON file, status 204 is returned.
    // if (!data.states) {
    //     return res.status(204).json({ 'message': 'No states found.' });
    // }
    
    // A copy of the array is made so the original stays in tact while processes are done to the temporary array.
    const arrLength = data.states.length;
    let newArray = [];
    for (let i = 0; i < arrLength; i++) {
        newArray.push(data.states[i]);
    }

    // Checks the URL for the 'contig' parameter.
    const urlContig = req.query.contig;
    const nonContigStates = ["HI", "AK"];

    // returns information on the non-contigusous states (AK, HI).
    if (urlContig && urlContig.toUpperCase() === 'FALSE') { 

        // This array temporarily stores the information for the noncontiguous states.
        const stateInfo = [];

        for (let i = 0; i < 2; i++) {
            var index = newArray.findIndex(obj => obj.code == nonContigStates[i]);
            const state = newArray.splice(index, 1);
            stateInfo.push(state[0]);
        }
        newArray = stateInfo;
    }
    else {      // returns information about all 50 states or 48 contiguous states

        // If 'contig' is true, Alaska and Hawaii are removed from the data.states array
        if (urlContig && urlContig.toUpperCase() === 'TRUE') { 
            
            for (let i = 0; i < 2; i++) {
                var index = newArray.findIndex(obj => obj.code == nonContigStates[i]);
                newArray.splice(index, 1);
            }
        }
    }

    // Loops through newArray and adds the fun facts from MongoDB to each element in the array.
    const length = newArray.length;

    for (let i = 0; i < length; i++) {
        const stateFromJson = newArray[i];
        const code = stateFromJson["code"];
        const stateFromDb = await State.findOne({ stateCode: code }).exec();
        const funFacts = stateFromDb["funfacts"];
        if (funFacts.length > 0) {
            stateFromJson.funfacts = funFacts;
        }
    }

    // Sorts the array according to state name
    newArray.sort( (a, b) => a.state.localeCompare(b.state) );

    res.json(newArray);
}

const getFunFact = async (req, res) => {

    // The variable 'code' contains the state code (abbrevation) from the URL.
    const code = req.params.state.toUpperCase();

    // // MIGHT NOT NEED THIS
    // // If no state code is entered or the code has an invalid length, status 400 is returned.
    // if (!code) {
    //     return res.status(400).json({ 'message': 'State code is required.' });
    // }

    // If a valid state code was given, the variable 'state' will contain the state's fun facts.
    const state = await State.findOne({ stateCode: code }).exec();

    // // If an invalid state code was given, then status 204 is returned.
    // if (!state) {
    //     return res.status(400).json({ 'message': 'Invalid state abbreviation parameter' });
    // }

    // The fun facts are put into an array. Then a random fact is chosen and put into a JSON object.
    const funFacts = state["funfacts"];



    const funFact = JSON.stringify({ "funfact": funFacts[Math.floor(Math.random() * funFacts.length)] });
    const funFactJSON = JSON.parse(funFact);

    res.json(funFactJSON);

    // // If the state has fun facts, they are sent with the response.
    // if (funFacts.length > 0) {
    //     const funFact = JSON.stringify({ "funfact": funFacts[Math.floor(Math.random() * funFacts.length)] });
    //     const funFactJSON = JSON.parse(funFact);
    
    //     res.json(funFactJSON);
    // }
    // else {      // If the state does not have any fun facts, status 400 is sent.
    //     const stateFromJson = data.states.find(stateObj => stateObj.code === code);
    //     return res.status(404).json({ 'message': `No Fun Facts found for ${stateFromJson.state}` });
    // }
}

const addFunFact = async (req, res) => {

    // The 'code' variable contains the state code (abbrevation) from the URL.
    const code = req.params.state.toUpperCase();

    // // If no state code is entered, status 400 is returned.
    // if (!code) {
    //     return res.status(400).json({ 'message': 'State code is required.' });
    // }

    // If a valid state code was given, the variable 'state' will contain the state's fun facts.
    const state = await State.findOne({ stateCode: code }).exec();

    // // If an invalid state code was given, then status 204 is returned.
    // if (!state) {
    //     return res.status(400).json({ 'message': 'Invalid state abbreviation parameter' });
    // }

    // This is the array of new fun facts to be added.
    const newFunFacts = req.body.funfacts;

    // // If no fun facts were in the body, then status 400 is sent.
    // if (!newFunFacts) {
    //     return res.status(400).json({'message': "State fun facts value required"});
    // }
    
    // // If the body of funfacts is not an array, status 400 is returned.
    // if(!Array.isArray(newFunFacts)) {
    //     return res.status(400).json({'message': "State fun facts value must be an array"});
    // }

    // Each new fun fact (an element in an array) is added to the current document's fun fact array.
    for (let i = 0; i < newFunFacts.length; i++) {
        try {
            await state.updateOne({ $push: {"funfacts": newFunFacts[i]} });
        } catch (err) {
            console.log(err);
        }  
    }

    // The fun fact is added to the DB document and it is returned.
    const updatedState = await State.findOne({ stateCode: code }).exec();

    res.json(updatedState);
}

const deleteFunFact = async (req, res) => {

    // The variable 'code' contains the state code (abbrevation) from the URL.
    const code = req.params.state.toUpperCase();

    // // If no state code is entered or the code has an invalid length, status 400 is returned.
    // if (!code || code.length !== 2) {
    //     return res.status(400).json({ 'message': 'State code is required.' });
    // }

    // If a valid state code was given, the variable 'state' will contain the state's fun facts.
    const state = await State.findOne({ stateCode: code }).exec();

    // If an invalid state code was given, then status 204 is returned.
    if (!state) {
        return res.status(400).json({ 'message': 'Invalid state abbreviation parameter' });
    }
        
    // Gets the index to be removed. The index information will should be sent in JSON format.
    // This is NOT zero indexed. If index is 1, then the first element in the array will be removed.
    const index = await req.body.index;

    // // If an index is not included in the body of the request, status 400 is returned.
    // if (!index || index === undefined) {
    //     return res.status(400).json({ 'message': 'State fun fact index value required' });
    // }

    // // If the state has no fun facts, status 404 is returned.
    // if (!state.funfacts.length > 0) {
    //     const stateFromJson = data.states.find(stateObj => stateObj.code === code);
    //     return res.status(404).json({ 'message': `No Fun Facts found for ${stateFromJson.state}` });
    // }    

    // // If the index is not in the array, status 400 is sent.
    // if (index > state.funfacts.length || index < 0) {
    //     const stateJSON = data.states.find(stateObj => stateObj.code === code);
    //     return res.status(400).json({ 'message': `No Fun Fact found at that index for ${stateJSON.state}` });
    // }

    // The fun fact is removed and the result returned.
    state.funfacts.splice(index - 1, 1);
    const result = await state.save();

    res.json(result);
}

const getState = async (req, res) => {

    // Gets the state code (state 2 letter abbreviation) from the URL and makes it uppercase.
    const code = req.params.state.toUpperCase();

    // If no state code is entered or the code has an invalid length, status 400 is returned.
    // if (!code) {
    //     return res.status(400).json({ 'message': 'State code is required.' });
    // }

    // If a valid state code was given, the variable 'state' will contain the state's fun facts.
    const stateFromDb = await State.findOne({ stateCode: code }).exec();

    // // If an invalid state code was given, then status 204 is returned.
    // if (!stateFromDb) {
    //     return res.status(400).json({ 'message': 'Invalid state abbreviation parameter' });
    // }

    // This stores all of the fun facts from the DB.
    const stateFunFacts = stateFromDb["funfacts"];

    // Finds the state information the JSON file.
    const stateFromJson = data.states.find(stateObj => stateObj.code === code);

    // // If the state does not exist in the JSON file, then status 404 is returned.
    // if(!stateFromJson) {
    //     return res.status(404).json({'message': 'Invalid state abbreviation parameter'});
    // }

    // The fun facts are added to the data from the JSON file.
    if (stateFunFacts.length > 0) {
        stateFromJson.funfacts = stateFunFacts;
    }

    res.json(stateFromJson);
}

const getCapital = async (req, res) => {

    // Gets the state code (state 2 letter abbreviation) and makes it uppercase
    const code = req.params.state.toUpperCase();

    // If no state code is entered, status 400 is returned.
    // if (!code) {
    //     return res.status(400).json({ 'message': 'State code is required.' });
    // }

    // Finds the state information the JSON file.
    const stateFromJson = data.states.find(stateObj => stateObj.code === code);

    // If the state does not exist in the JSON file, then status 404 is returned.
    // if(!stateFromJson) {
    //     return res.status(404).json({'message': 'Invalid state abbreviation parameter'});
    // }

    res.json({
        "state": stateFromJson.state,
        "capital": stateFromJson.capital_city
    });
}

const getNickname = async (req, res) => {

    // Gets the state code (state 2 letter abbreviation) and makes it uppercase
    const code = req.params.state.toUpperCase();

    // If no state code is entered, status 400 is returned.
    // if (!code) {
    //     return res.status(400).json({ 'message': 'State code is required.' });
    // }

    // Finds the state information the JSON file.
    const stateFromJson = data.states.find(stateObj => stateObj.code === code);

    // // If the state does not exist in the JSON file, then status 404 is returned.
    // if(!stateFromJson) {
    //     return res.status(404).json({'message': 'Invalid state abbreviation parameter'});
    // }

    res.json({
        "state": stateFromJson.state,
        "nickname": stateFromJson.nickname
    });
}

const getPopulation = async (req, res) => {

    // Gets the state code (state 2 letter abbreviation) and makes it uppercase
    const code = req.params.state.toUpperCase();

    // If no state code is entered, status 400 is returned.
    // if (!code) {
    //     return res.status(400).json({ 'message': 'State code is required.' });
    // }

    // Finds the state information the JSON file.
    const stateFromJson = data.states.find(stateObj => stateObj.code === code);

    // If the state does not exist in the JSON file, then status 404 is returned.
    // if(!stateFromJson) {
    //     return res.status(404).json({'message': 'Invalid state abbreviation parameter'});
    // }

    res.json({
        "state": stateFromJson.state,
        "population": stateFromJson.population.toLocaleString()
    });
}

const getAdmission = async (req, res) => {

    // Gets the state code (state 2 letter abbreviation) and makes it uppercase
    const code = req.params.state.toUpperCase();

    // If no state code is entered, status 400 is returned.
    // if (!code) {
    //     return res.status(400).json({ 'message': 'State code is required.' });
    // }

    // Finds the state information the JSON file.
    const stateFromJson = data.states.find(stateObj => stateObj.code === code);

    // If the state does not exist in the JSON file, then status 404 is returned.
    // if(!stateFromJson) {
    //     return res.status(404).json({'message': 'Invalid state abbreviation parameter'});
    // }

    res.json({
        "state": stateFromJson.state,
        "admitted": stateFromJson.admission_date
    });
}

const updateFunFact = async (req, res) => {

    // The variable 'code' contains the state code (abbrevation) from the URL.
    const code = req.params.state.toUpperCase();

    // // If no state code is entered, status 400 is returned.
    // if (!code) {
    //     return res.status(400).json({ 'message': 'State code is required.' });
    // }

    // If a valid state code was given, the variable 'state' will contain the state's fun facts.
    const state = await State.findOne({ stateCode: code }).exec();

    // // If an invalid state code was given, then status 204 is returned.
    // if (!state) {
    //     return res.status(400).json({ 'message': 'Invalid state abbreviation parameter' });
    // }
        
    // Gets the index to be removed. The index information will should be sent in JSON format.
    // This is NOT zero indexed. If index is 1, then the first element in the array will be removed.
    const index = await req.body.index;

    // // If an index is not included in the body of the request, status 400 is returned.
    // if (!index || index === undefined) {
    //     return res.status(400).json({ 'message': 'State fun fact index value required' });
    // }

    // // If the state has no fun facts, status 404 is returned.
    // if (!state.funfacts.length > 0) {
    //     const stateFromJson = data.states.find(stateObj => stateObj.code === code);
    //     return res.status(404).json({ 'message': `No Fun Facts found for ${stateFromJson.state}` });
    // }    

    // // If the index is not in the array, status 400 is sent.
    // if (index > state.funfacts.length || index < 1) {
    //     const stateJSON = data.states.find(stateObj => stateObj.code === code);
    //     return res.status(400).json({ 'message': `No Fun Fact found at that index for ${stateJSON.state}` });
    // }

    const newFunFact = await req.body.funfact;

    // if (!newFunFact || newFunFact === '') {
    //     return res.status(500).json({ 'message': 'State fun fact value required' });
    // }

    state.funfacts[index - 1] = newFunFact;
    const result = await state.save();

    res.json(result);
}

// // FOR TESTING ////////////////////////////
// // This function was used to populate the DB during testing. This was faster than manually entering data into the DB.
// const createNewState = async (req, res) => {

//     const code = req.params.state.toUpperCase();

//     // If no state code is entered or the code has an invalid length, status 400 is returned.
//     if (!code || code.length !== 2) {
//         return res.status(400).json({ 'message': 'State code is required.' });
//     }

//     // If a valid state code was given, the variable 'state' will exist.
//     const state = await State.findOne({ stateCode: code }).exec();

//     // If the state already exists in the database, status 400 is sent.
//     if (state) {
//         return res.status(400).json({ 'message': 'State already exists' });
//     }

//     // Creates the new entry in the db.
//     try {
//         const result = await State.create({
//             stateCode: code,
//         });

//         res.status(201).json(result);
//     } catch (err) {
//         console.error(err);
//     }
// }


module.exports = {
    getAllStates,
    getFunFact,
    addFunFact,
    deleteFunFact,
    getState,
    getCapital,
    getNickname,
    getPopulation,
    getAdmission,
    updateFunFact
}