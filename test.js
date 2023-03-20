//const mapper = require("./mapper")
const config = require("./config")
const assets = require ("./assets/assets")
const chai = require("chai")
const axios = require("axios")
describe("test", function () {

  let n = 1;

  before(() => console.log("Testing started"));
  after(() => console.log("Testing finished"));

  beforeEach(() => console.log("Test ", n++));
  afterEach(() => console.log("Test ", n - 1, " finished"));

  it(
    'test 1', async () => {
      let res = await axios.post(
        'http://localhost:' + config.httpPort + '/api/mapper',
        {
          sourceDataIn: "ExampleSource.csv",
          mapPathIn: "ExampleMap.json",
          dataModelIn: "ExampleDataModel",
          csvDelimiter: ";"
        }
      )
      try {
        chai.assert.equal(
          JSON.stringify(res.data[0]),
          JSON.stringify(assets.sample)
        )
      }
      catch (error) {
        console.log(JSON.parse(error.actual), JSON.parse(error.expected))
        throw error
      }
    }
  );
});
