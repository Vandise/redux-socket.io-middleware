import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import chai from 'chai';

chai.use(sinonChai);
global.expect = chai.expect;
global.sinon = sinon;
global.chai = chai;
