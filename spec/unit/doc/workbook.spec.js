'use strict';

var expect = require('chai').expect;

var Excel = require('../../../excel');
var testUtils = require('../../testutils');

var simpleWorkbookModel = require('./../data/simpleWorkbook.json');

// =============================================================================
// Helpers

function createSimpleWorkbook() {
  var wb = new Excel.Workbook();
  var ws = wb.addWorksheet('blort');

  // plain number
  ws.getCell('A1').value = 7;
  ws.getCell('A1').name = 'Seven';

  // simple string
  ws.getCell('B1').value = 'Hello, World!';
  ws.getCell('B1').name = 'Hello';

  // floating point
  ws.getCell('C1').value = 3.14;

  // date-time
  ws.getCell('D1').value = new Date();

  // hyperlink
  ws.getCell('E1').value = {text: 'www.google.com', hyperlink:'http://www.google.com'};

  // number formula
  ws.getCell('A2').value = {formula: 'A1', result: 7};
  ws.getCell('A2').name = 'TheFormula';

  // string formula
  ws.getCell('B2').value = {formula: 'CONCATENATE("Hello", ", ", "World!")', result: 'Hello, World!'};
  ws.getCell('B2').name = 'TheFormula';

  // date formula
  ws.getCell('C2').value = {formula: 'D1', result: new Date()};

  return wb;
}

// =============================================================================
// Tests

describe('Workbook', function() {

  it('serialises and deserialises by model', function() {
    var wb = testUtils.createTestBook(false, Excel.Workbook);

    return testUtils.cloneByModel(wb, Excel.Workbook)
      .then(function(wb2) {
        testUtils.checkTestBook(wb2, 'model');
      });
  });

  it('stores shared string values properly', function() {
    var wb = new Excel.Workbook();
    var ws = wb.addWorksheet('blort');

    ws.getCell('A1').value = 'Hello, World!';

    ws.getCell('A2').value = 'Hello';
    ws.getCell('B2').value = 'World';
    ws.getCell('C2').value = {formula: 'CONCATENATE(A2, ", ", B2, "!")', result: 'Hello, World!'};

    ws.getCell('A3').value = ['Hello', 'World'].join(', ') + '!';

    // A1 and A3 should reference the same string object
    expect(ws.getCell('A1').value).to.equal(ws.getCell('A3').value);

    // A1 and C2 should not reference the same object
    expect(ws.getCell('A1').value).to.equal(ws.getCell('C2').value.result);
  });

  it('assigns cell types properly', function() {
    var wb = createSimpleWorkbook();
    var ws = wb.getWorksheet('blort');

    expect(ws.getCell('A1').type).to.equal(Excel.ValueType.Number);
    expect(ws.getCell('B1').type).to.equal(Excel.ValueType.String);
    expect(ws.getCell('C1').type).to.equal(Excel.ValueType.Number);
    expect(ws.getCell('D1').type).to.equal(Excel.ValueType.Date);
    expect(ws.getCell('E1').type).to.equal(Excel.ValueType.Hyperlink);

    expect(ws.getCell('A2').type).to.equal(Excel.ValueType.Formula);
    expect(ws.getCell('B2').type).to.equal(Excel.ValueType.Formula);
    expect(ws.getCell('C2').type).to.equal(Excel.ValueType.Formula);
  });

  it.skip('serialises to model', function() {
    var wb = createSimpleWorkbook();
    expect(wb.model).to.deep.equal(simpleWorkbookModel);
  });
});
