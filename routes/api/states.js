const express = require('express');
const router = express.Router();
const statesController = require('../../controllers/statesController');

const validate = require('../../middleware/validateUrlAndBody');


// Handles request to get all states
router.route('/')
    .get(validate.validateStatesFromJson, 
        statesController.getAllStates)

// Handles URLs that have a two letter abbreviation a the state in the URL.
router.route('/:state')
    .get(validate.validateStateFromJson, 
        statesController.getState)
    // .post(statesController.createNewState);     // ONLY FOR TESTING; used to create new documents in the DB faster.

// Handles URLs that have a two letter abbreviation and funfact in the URL.
router.route('/:state/funfact')
    .get(validate.validateStateFromJson,
        validate.validateFunFactsFromJson, 
        statesController.getFunFact)

    .post(validate.validateStateFromJson, 
        validate.validateFunFactsFromBody, 
        statesController.addFunFact)

    .delete(validate.validateIndexFromBody,
        validate.validateFunFactsFromJson,
        validate.validateIndexExistsInJson,
        statesController.deleteFunFact)

    .patch(validate.validateStateFromJson,
        validate.validateIndexFromBody,
        validate.validateIndexExistsInJson,
        statesController.updateFunFact);

// Handles URLs that have a two letter abbreviation and capital in the URL.
router.route('/:state/capital')
    .get(validate.validateStateFromJson,
        statesController.getCapital);

// Handles URLs that have a two letter abbreviation and nickname in the URL.
router.route('/:state/nickname')
    .get(validate.validateStateFromJson,
        statesController.getNickname);

// Handles URLs that have a two letter abbreviation and population in the URL.
router.route('/:state/population')
    .get(validate.validateStateFromJson,
        statesController.getPopulation);

// Handles URLs that have a two letter abbreviation and addmission in the URL.
router.route('/:state/admission')
    .get(validate.validateStateFromJson,
        statesController.getAdmission);

    
module.exports = router;