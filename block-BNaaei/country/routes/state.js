var express = require('express');
var User = require('../models/User');
var State = require('../models/State');
var Country = require('../models/Country');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/list/:type', (req, res, next) => {
  let type = req.params.type;

  State.find({}, (err, states) => {
    if (err) return next(err);

    //to list all countries
    if (type === 'all') {
      return res.json({ states });
    }
    //to list in asccending order
    if (type === 'asc') {
      states = states.sort(function (a, b) {
        var nameA = a.name.toUpperCase();
        var nameB = b.name.toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      });

      return res.json({ states });
    }

    //to list in desc order
    if (type === 'desc') {
      states = states.sort(function (a, b) {
        var nameA = a.name.toUpperCase();
        var nameB = b.name.toUpperCase();
        if (nameA < nameB) {
          return 1;
        }
        if (nameA > nameB) {
          return -1;
        }

        // names must be equal
        return 0;
      });

      return res.json({ states });
    }
  });
});

//list states in asccending order by population

router.get('/listAsc/byPopulation', (req, res, next) => {
  State.find({}, (err, states) => {
    if (err) return next(err);

    states = states.sort(function (a, b) {
      return a.population - b.population;
    });

    res.json({ states });
  });
});

//list neighbour states

router.get('/:id/neighbours', (req, res, next) => {
  let stateId = req.params.id;

  State.findById(stateId)
    .populate('neighbouring_states')
    .exec((err, neighbouringStates) => {
      res.json({ neighbouringStates });
    });
});

//update state

router.post('/:id/update', (req, res, next) => {
  let stateId = req.params.id;
  let data = req.body;

  State.findByIdAndUpdate(stateId, data, (err, updatedState) => {
    if (err) return next(err);

    res.json({ updatedState });
  });
});

//delete state

router.get('/:id/delete', (req, res, next) => {
  let stateId = req.params.id;

  State.findByIdAndDelete(stateId, (err, deletedState) => {
    if (err) return next(err);

    Country.findByIdAndUpdate(
      deletedState.country,
      {
        $pull: { states: deletedState.id },
      },
      (err, updatedCountry) => {
        if (err) return next(err);

        res.json({ deletedState, updatedCountry });
      }
    );
  });
});

module.exports = router;