//const mapper = require("./mapper")
const config = require("./config")
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
          //JSON.parse(
          JSON.stringify(
            res.data[0]
          )
          //)
          //.toString()
          ,
          //JSON.parse(
          JSON.stringify(
            {
              "Field 1": "[Field 1 value 1,Field 1 value 2]",
              "Field 2": [
                "Field 2 value 1",
                "Field 2 value 2"
              ],
              "Field 3": [
                "Field 3 value 1",
                "Field 3 value 2"
              ],
              "Field 31": [
                {
                  "Field 31a": "Field 31a",
                  "Field 31b": "Field 31b"
                }
              ],
              "Field 32": 33,
              "Field 33": 33,
              "Field 4": {
                "Field 4a": "[Field 4a value 1,Field 4a value 2]",
                "Field 4b": [
                  "Field 4b value 1",
                  "Field 4b value 2"
                ],
                "Field 4c": [
                  "Field 4c value 1",
                  "Field 4c value 1"
                ],
                "Field 4d": [
                  {
                    "Field 4da": "Field 4da",
                    "Field 4db": "Field 4db"
                  },
                  {
                    "Field 4da1": "Field 4da1",
                    "Field 4db1": "Field 4db1"
                  }
                ]
              },
              "Field 5": 5,
              "Field 6": 6,
              "Field 7": "7",
              "type": "Example",
              "id": "urn:ngsi-ld:Example:SomeRZ:SomeService:CSV:ExampleDataModel-1"
            }
          )
          //)
          //.toString()
        )
      }
      catch (error) {
        console.log(JSON.parse(error.actual), JSON.parse(error.expected))
        throw error
      }
    }
  );
});
