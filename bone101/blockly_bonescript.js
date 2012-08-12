if (!Blockly.Language) Blockly.Language = {};
Blockly.JavaScript = Blockly.Generator.get('JavaScript');

Blockly.Language.bonescript_digitalWrite = {
 category: 'Bonescript',
 init: function() {
  this.setColour(160);
  this.appendTitle('digitalWrite');
  this.appendInput('pin', Blockly.INPUT_VALUE, 'PIN', Object);
  var highLowDropdown = new Blockly.FieldDropdown([['HIGH', 1], ['LOW', 0]]);
  this.appendTitle(highLowDropdown, 'VALUE');
  this.setPreviousStatement(true);
  this.setNextStatement(true);
 }
};

Blockly.JavaScript.bonescript_digitalWrite = function () {
 var argument0 = Blockly.JavaScript.valueToCode('PIN',
  Blockly.JavaScript.ORDER_MEMBER) || '{}';
 var argument1 = Blockly.JavaScript.getTitleValue('VALUE') || '0';
 var code = 'digitalWrite(' + argument0 + ',' + argument1 + ');\n';
 return code;
};
