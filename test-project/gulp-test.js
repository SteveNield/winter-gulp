var chai = require('chai');

const should = chai.should();

describe('some test', function(){
  it('sums two numbers', function(){
    function sum(a,b){
      return a+b;
    }

    sum(1,1).should.equal(2);
  })
})
